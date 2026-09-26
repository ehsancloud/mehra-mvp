import React, { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import ReleasePaymentModal from "../components/ReleasePaymentModal";
import { BiExport } from "react-icons/bi";
import PaymentReceiptModal from "../components/PaymentReceiptModal";
import {
  getFinanceStats,
  getFinanceProjects,
  addTransaction,
  getUsers,
} from "../data/api";
import { useAuthStore } from "../store/authStore";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

const TRANSACTION_STATE_STYLES = {
  paid: { borderBg: "border-r-[6px] border-r-green-600", statusBg: "bg-green-100 text-green-700", hasDetailsBtn: true, isBlocked: false },
  blocked: { borderBg: "border-r-[6px] border-r-red-700", statusBg: "bg-red-100 text-red-700", hasDetailsBtn: false, isBlocked: true },
  pending: { borderBg: "border-r-[6px] border-r-amber-700", statusBg: "bg-amber-100 text-amber-800", hasDetailsBtn: false, isBlocked: false },
};

const SupervisorFinance = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // استیت‌های ساخت تراکنش جدید
  const [txAmount, setTxAmount] = useState("");
  const [txStatus, setTxStatus] = useState("در انتظار پرداخت");
  const [txTarget, setTxTarget] = useState("");
  const [employers, setEmployers] = useState([]);
  const [isAddingTx, setIsAddingTx] = useState(false);

  const { user: currentSupervisor } = useAuthStore();

  useEffect(() => {
    getFinanceStats().then(setStats);
    getFinanceProjects().then((list) => {
      setProjects(list);
      setSelectedProject(list[0] || null);
    });
    getUsers({ role: "employer" }).then((list) => {
      setEmployers(list || []);
      if (list && list.length > 0) {
        setTxTarget(list[0]._id || list[0].id);
      }
    });
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!selectedProject || !txAmount) return;
    
    setIsAddingTx(true);
    const selectedEmp = employers.find(
      (emp) => (emp._id || emp.id)?.toString() === txTarget?.toString()
    );
    const stateMap = {
      "در انتظار پرداخت": "pending",
      "پرداخت شده": "paid",
      "بلاک شده": "blocked"
    };

    const payload = {
      amount: Number(txAmount),
      status: txStatus,
      state: stateMap[txStatus] || "pending",
      targetId: selectedEmp ? (selectedEmp._id || selectedEmp.id) : undefined,
      target: selectedEmp ? selectedEmp.username : undefined
    };

    const res = await addTransaction(selectedProject.id || selectedProject._id, payload);
    setIsAddingTx(false);

    if (res.ok) {
      alert("تراکنش با موفقیت ثبت شد.");
      setTxAmount("");
      
      // اضافه کردن تراکنش جدید به لیست محلی UI
      setSelectedProject(prev => ({
        ...prev,
        transactions: [...(prev.transactions || []), res.transaction]
      }));
    } else {
      alert(res.message || "خطا در ثبت تراکنش.");
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 overflow-hidden" dir="rtl">
      <header className="w-full flex justify-between items-center px-12 py-6 shrink-0 select-none">
        <h1 className="text-[32px] font-bold text-[#1c1c1e]" style={{ fontFamily: "Pinar-FD" }}>مدیریت مالی</h1>
        <UserHeader userInitial={currentSupervisor?.initial} hasNotification={true} />
      </header>

      <div className="flex-1 w-full overflow-y-auto px-12 pb-12 flex flex-col gap-6 scrollbar-none select-none">
        <div className="w-full grid grid-cols-4 gap-4" style={{ fontFamily: "Pinar-FD" }}>
          {/* کارت‌های آماری بالا (مشابه قبل) */}
          <div className="bg-white border-2 border-[#1e40af] rounded-[5px] p-3 shadow-[0_3px_0_0_#1e40af] flex flex-col justify-between h-[80px] text-right">
            <span className="text-[11px] text-gray-500">تعداد پروژه فعال</span>
            <div className="flex items-baseline justify-start gap-1">
              <span className="text-[22px] font-bold text-[#1e40af]">{(stats?.activeProjectsCount ?? 0).toLocaleString("fa-IR")}</span>
              <span className="text-[10px] text-gray-500">پروژه</span>
            </div>
          </div>
          <div className="bg-white border-2 border-[#1e40af] rounded-[5px] p-3 shadow-[0_3px_0_0_#1e40af] flex flex-col justify-between h-[80px] text-right">
            <span className="text-[11px] text-gray-500">در انتظار تسویه</span>
            <div className="flex items-baseline justify-start gap-1">
              <span className="text-[20px] font-bold text-[#1e40af]">{formatPrice(stats?.awaitingSettlement)}</span>
              <span className="text-[10px] text-gray-500">تومان</span>
            </div>
          </div>
          <div className="bg-white border-2 border-[#1e40af] rounded-[5px] p-3 shadow-[0_3px_0_0_#1e40af] flex flex-col justify-between h-[80px] text-right">
            <span className="text-[11px] text-gray-500">آزادسازی این ماه</span>
            <div className="flex items-baseline justify-start gap-1">
              <span className="text-[20px] font-bold text-[#1e40af]">{formatPrice(stats?.releasedThisMonth)}</span>
              <span className="text-[10px] text-gray-500">تومان</span>
            </div>
          </div>
          <div className="bg-white border-2 border-[#1e40af] rounded-[5px] p-3 shadow-[0_3px_0_0_#1e40af] flex flex-col justify-between h-[80px] text-right">
            <span className="text-[11px] text-gray-500">مجموع پول بلاک شده</span>
            <div className="flex items-baseline justify-start gap-1">
              <span className="text-[20px] font-bold text-[#1e40af]">{formatPrice(stats?.totalBlocked)}</span>
              <span className="text-[10px] text-gray-500">تومان</span>
            </div>
          </div>
        </div>

        <div className="w-full flex gap-6 items-start">
          <div className="flex-1 bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] overflow-hidden" style={{ fontFamily: "Pinar-FD" }}>
            <div className="bg-[#e1effe] p-2.5 border-b border-black text-right text-[12px] font-bold text-[#1e40af]">لیست پروژه ها</div>
            <div className="grid grid-cols-5 p-3 bg-gray-100/70 border-b border-gray-200 text-[11px] font-bold text-gray-500 items-center">
              <div className="text-right pr-4">عنوان پروژه</div>
              <div className="text-center">تاریخ</div>
              <div className="text-center">مبلغ کل</div>
              <div className="text-center">بلاک شده</div>
              <div className="text-center">آزادسازی</div>
            </div>
            <div className="flex flex-col">
              {projects.map((proj) => (
                <div key={proj.id || proj._id} onClick={() => setSelectedProject(proj)} className={`grid grid-cols-5 p-3.5 border-b border-gray-200 text-[12px] items-center cursor-pointer transition-all ${selectedProject?.id === proj.id || selectedProject?._id === proj._id ? "bg-blue-50/80 font-bold border-l-4 border-l-[#3b82f6]" : "hover:bg-gray-50"}`}>
                  <div className="text-right pr-4 font-bold text-black">{proj.title}</div>
                  <div className="text-center text-gray-500 text-[11px]">{proj.date || "—"}</div>
                  <div className="text-center text-black font-medium">{formatPrice(proj.totalAmount)} ت</div>
                  <div className="text-center text-red-700 font-bold">{proj.blockedAmount > 0 ? `${formatPrice(proj.blockedAmount)} ت` : "—"}</div>
                  <div className="flex justify-center">
                    {proj.statusType === "جزئی" && <span className="bg-[#fef3c7] text-[#92400e] px-3 py-0.5 rounded-[4px] text-[10px] font-bold">جزئی</span>}
                    {proj.statusType === "بلاک" && <span className="bg-[#fee2e2] text-[#991b1b] px-3 py-0.5 rounded-[4px] text-[10px] font-bold">بلاک</span>}
                    {proj.statusType === "کامل" && <span className="bg-[#dcfce7] text-[#166534] px-3 py-0.5 rounded-[4px] text-[10px] font-bold">کامل</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-[380px] bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-4 flex flex-col gap-4 shrink-0" style={{ fontFamily: "Pinar-FD" }}>
            <div className="w-full bg-[#e1effe] border border-blue-200 rounded-[4px] p-2 text-center text-[12px] font-bold text-[#1e40af]">
              {selectedProject ? selectedProject.title : "انتخاب پروژه"}
            </div>

            {/* لیست تراکنش‌های پروژه انتخابی */}
            <div className="flex flex-col gap-3 min-h-[160px] max-h-[220px] overflow-y-auto scrollbar-none">
              {selectedProject?.transactions && selectedProject.transactions.length > 0 ? (
                selectedProject.transactions.map((tx) => {
                  const style = TRANSACTION_STATE_STYLES[tx.state] || TRANSACTION_STATE_STYLES.pending;
                  return (
                    <div key={tx.id || tx._id} className={`w-full bg-white border border-gray-300 rounded-[5px] p-3 shadow-sm flex flex-col gap-2 relative ${style.borderBg}`}>
                      <div className="flex justify-between items-center">
                        <span className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold ${style.statusBg}`}>{tx.status || tx.state}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">{tx.date ? new Date(tx.date).toLocaleDateString('fa-IR') : ""}</span>
                          <span className="text-[14px] font-bold text-black">{formatPrice(tx.amount)} ت</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-gray-600 mt-1">
                        {style.hasDetailsBtn && (
                          <button onClick={() => { setSelectedTxn({ ...tx, projectName: selectedProject.title }); setIsReceiptModalOpen(true); }} className="h-[24px] px-2.5 bg-[#1c1c1e] text-white rounded-[4px] text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-zinc-700">
                            جزئیات <BiExport className="text-xs" />
                          </button>
                        )}
                        {style.isBlocked && (
                          <button onClick={() => setIsModalOpen(true)} className="h-[24px] px-3 bg-[#166534] text-white rounded-[4px] text-[10px] font-bold cursor-pointer shadow-sm active:translate-y-[1px]">
                            پرداخت / آزادسازی
                          </button>
                        )}
                        <span className="mr-auto text-[10px]">{tx.target ? `← ${tx.target}` : ""}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 text-[12px] my-auto">تراکنشی برای این پروژه یافت نشد.</div>
              )}
            </div>

            {/* فرم ثبت دستی تراکنش جدید */}
            {selectedProject && (
              <form onSubmit={handleAddTransaction} className="flex flex-col gap-2 border-t border-gray-200 pt-3">
                <span className="text-[11px] font-bold text-black mb-1 text-right">افزودن تراکنش دستی</span>
                <input
                  type="number"
                  placeholder="مبلغ (تومان)"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded px-2 text-[11px] font-mono focus:border-black focus:outline-none bg-gray-50 text-right"
                  required
                />
                <select
                  value={txTarget}
                  onChange={(e) => setTxTarget(e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded px-2 text-[11px] bg-white cursor-pointer focus:outline-none text-right"
                  required
                >
                  <option value="" disabled>انتخاب کارفرما</option>
                  {employers.map((emp) => (
                    <option key={emp._id || emp.id} value={emp._id || emp.id}>
                      {emp.firstName ? `${emp.firstName} ${emp.lastName} (${emp.username})` : emp.username}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isAddingTx}
                    className="flex-1 bg-[#1c1c1e] text-white h-8 rounded text-[11px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer disabled:opacity-50"
                  >
                    {isAddingTx ? "در حال ثبت..." : "ثبت تراکنش"}
                  </button>
                  <select
                    value={txStatus}
                    onChange={(e) => setTxStatus(e.target.value)}
                    className="flex-1 h-8 border border-gray-300 rounded px-2 text-[11px] bg-white cursor-pointer focus:outline-none text-right"
                  >
                    <option value="در انتظار پرداخت">در انتظار پرداخت</option>
                    <option value="پرداخت شده">پرداخت شده</option>
                    <option value="بلاک شده">بلاک شده</option>
                  </select>
                </div>
              </form>
            )}

            <div className="w-full border-t border-gray-200 pt-3 flex justify-between items-center text-[14px] font-bold text-black">
              <span>{formatPrice(selectedProject?.totalAmount)} تومان</span>
              <span className="text-gray-500 text-[12px]">مبلغ کل پروژه:</span>
            </div>
          </div>
        </div>
      </div>

      <ReleasePaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
        onReleased={(updatedProject) => {
          setSelectedProject(updatedProject);
          setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
        }}
      />

      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        txData={selectedTxn}
      />
    </div>
  );
};

export default SupervisorFinance;