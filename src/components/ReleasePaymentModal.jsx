import React, { useState, useEffect } from "react";
import { BiX } from "react-icons/bi";
import { releaseFinanceTransaction, getProjectById } from "../data/api";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, "،") : "۰";
};

const ReleasePaymentModal = ({ isOpen, onClose, project, onReleased }) => {
  const [amount, setAmount] = useState("");
  const [freelancers, setFreelancers] = useState([]);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // واکشی اطلاعات واقعی پروژه برای دریافت لیست آیدی فریلنسرها
  useEffect(() => {
    if (isOpen && project?.projectId) {
      // آیدی پروژه اصلی را از شیء پروژه مالی استخراج می‌کنیم
      const actualProjectId =
        typeof project.projectId === "object"
          ? project.projectId._id || project.projectId.id
          : project.projectId;

      getProjectById(actualProjectId).then((data) => {
        if (data && data.freelancersList) {
          setFreelancers(data.freelancersList);
          if (data.freelancersList.length > 0) {
            setSelectedFreelancerId(
              data.freelancersList[0]._id || data.freelancersList[0].id
            );
          }
        }
      });
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      alert("مبلغ نامعتبر است.");
      return;
    }

    if (numAmount > project.blockedAmount) {
      alert(
        `مبلغ نمی‌تواند بیشتر از مقدار مسدود شده (${formatPrice(
          project.blockedAmount
        )} تومان) باشد.`
      );
      return;
    }

    if (!selectedFreelancerId) {
      alert("لطفاً فریلنسر را انتخاب کنید.");
      return;
    }

    setIsSubmitting(true);
    const result = await releaseFinanceTransaction({
      financeProjectId: project._id || project.id,
      transactionId: "dummy", // در بک‌اند شما این پارامتر در مسیر قرار دارد اما برای این عملیات خوانده نمی‌شود
      amount: numAmount,
      freelancerId: selectedFreelancerId,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      alert(result.message || "خطا در آزادسازی وجه");
      return;
    }

    alert("وجه با موفقیت آزاد شد.");

    // آپدیت پروژه در UI بدون نیاز به واکشی مجدد کل پروژه‌های مالی
    const updatedProject = {
      ...project,
      blockedAmount: project.blockedAmount - numAmount,
      transactions: [...(project.transactions || []), result.transaction],
    };

    if (onReleased) onReleased(updatedProject);
    setAmount("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="w-[420px] bg-white border border-black rounded-[8px] p-6 relative z-10 flex flex-col gap-6 shadow-[0_6px_0_0_#000000]"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-[18px] font-bold text-black">آزادسازی وجه</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl cursor-pointer transition-colors"
          >
            <BiX />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-red-50 border border-red-200 p-3 rounded-[5px] text-[13px] text-gray-700">
            <span>مبلغ مسدود شده فعلی:</span>
            <span className="font-bold text-red-600">
              {formatPrice(project.blockedAmount)} تومان
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative w-full">
            <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
              انتخاب فریلنسر (مقصد وجه)
            </label>
            <select
              value={selectedFreelancerId}
              onChange={(e) => setSelectedFreelancerId(e.target.value)}
              className="w-full h-[46px] border border-black rounded-[5px] px-3 text-[13px] text-black focus:outline-none bg-white cursor-pointer"
              required
            >
              {freelancers.length === 0 ? (
                <option value="" disabled>
                  در حال بارگذاری یا بدون فریلنسر...
                </option>
              ) : (
                freelancers.map((f) => (
                  <option key={f.id || f._id} value={f.id || f._id}>
                    {f.firstName} {f.lastName} {f.username && `(${f.username})`}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="relative w-full">
            <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
              مبلغ آزادسازی (تومان)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مثلاً 5000000"
              className="w-full h-[46px] border border-black rounded-[5px] px-3 text-[13px] text-black focus:outline-none bg-white font-mono"
              required
              min="1"
              max={project.blockedAmount}
            />
          </div>

          <div className="flex gap-3 w-full border-t border-gray-100 pt-4 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[42px] border border-black bg-white text-black text-[13px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              لغو
            </button>
            <button
              type="submit"
              disabled={isSubmitting || project.blockedAmount <= 0}
              className="flex-1 h-[42px] border border-black bg-[#166534] text-white text-[13px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-60 disabled:bg-gray-400 disabled:border-gray-500"
            >
              {isSubmitting ? "در حال ثبت..." : "تایید و آزادسازی"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReleasePaymentModal;