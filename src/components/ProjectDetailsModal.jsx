import React, { useState, useEffect } from "react";
import {
  BiX,
  BiMessageSquareDetail,
  BiReceipt,
  BiChevronLeft,
} from "react-icons/bi";
import { useTicket } from "../context/TicketContext";
import { getProjectStatusStyle } from "../utils/projectStatus";
import { declareReadiness, createProposal } from "../data/api";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, "،") : "۰";
};

const getReadinessButtonState = (applicationStatus) => {
  if (applicationStatus === "applied") {
    return { label: "اعلام آمادگی شد", disabled: true };
  }
  if (applicationStatus === "rejected") {
    return { label: "رد شد", disabled: true };
  }
  return { label: "اعلام آمادگی", disabled: false };
};

const ProjectDetailsModal = ({
  isOpen,
  onClose,
  project,
  onDeclareReadiness,
}) => {
  const { openChat } = useTicket();
  
  // استیت‌های مورد نیاز برای ارسال پروپوزال
  const [proposedCost, setProposedCost] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ریست کردن فرم با باز و بسته شدن مودال
  useEffect(() => {
    if (isOpen) {
      setProposedCost("");
      setNote("");
      setIsSubmitting(false);
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const {
    id,
    title,
    budget,
    paidAmount,
    supervisor,
    department,
    employer,
    deadline,
    description,
    isSuperProject,
    progress,
    stage, // 'open' | 'active' | 'completed'
    payments,
    subProjects,
    status,
    applicationStatus,
  } = project;

  // TODO(API): replace with a real invoice fetch/download
  const handleViewPayment = (payment) => {
    console.log("View payment details:", payment.id);
  };

  // TODO(API): navigate to that sub-project's own details
  const handleViewSubProject = (subProject) => {
    console.log("View sub-project details:", subProject.id);
  };

  const readinessButton = getReadinessButtonState(applicationStatus);
  const statusBadgeStyle = getProjectStatusStyle(status);

  const handleApplyOrProposal = async () => {
    if (stage !== "open") return;

    setIsSubmitting(true);

    // اگر فریلنسر قیمت یا یادداشت جدیدی وارد کرده بود:
    if (proposedCost || note) {
       const result = await createProposal(id, {
           proposedCost: Number(proposedCost) || budget, // اگر خالی بود همون بودجه اصلی ثبت بشه
           note: note || "پیشنهاد جدید برای این پروژه"
       });
       
       setIsSubmitting(false);
       
       if (result.ok) {
           alert("پیشنهاد شما با موفقیت ثبت شد.");
           if (onDeclareReadiness) {
               onDeclareReadiness({ ...project, applicationStatus: "applied" });
           } else {
             onClose();
           }
       } else {
           alert(result.message || "خطا در ثبت پیشنهاد.");
       }
    } else {
       // اگر فیلدها خالی بود یعنی فقط اعلام آمادگی ساده می‌کند:
       const result = await declareReadiness({ projectId: id });
       setIsSubmitting(false);

       if (result.ok) {
          if(onDeclareReadiness) {
             onDeclareReadiness({ ...project, applicationStatus: "applied" });
          }
          onClose();
       } else {
          alert(result.message || "خطا در اعلام آمادگی.");
       }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main modal frame */}
      <div
        className={`
          bg-white border rounded-[5px] p-6 relative z-10 flex flex-col gap-6 select-none max-h-[90vh] overflow-y-auto scrollbar-none
          ${isSuperProject && stage === "active" ? "w-[750px] border-[#3b82f6]" : "w-[720px] border-black shadow-[0_6px_0_0_#000000]"}
        `}
        style={{ fontFamily: "Pinar-FD" }}
      >
        {/* Super-project badge */}
        {isSuperProject && (
          <span className="absolute top-0 left-6 bg-[#3b82f6] text-white text-[11px] font-bold px-3 py-1 rounded-b-[4px]">
            ابر پروژه
          </span>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl cursor-pointer transition-colors"
        >
          <BiX />
        </button>

        {/* Top section: main project info, split right/left */}
        <div className="w-full flex gap-6 items-start mt-2">
          {/* Right: text details + tags */}
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-[22px] font-bold text-black text-right">
              {title}
            </h2>

            <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-[12px] text-right">
              <div>
                <span className="text-gray-400 block mb-0.5">ناظر پروژه</span>
                <span className="font-bold text-black flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[10px]">
                    {supervisor ? supervisor.charAt(0) : "M"}
                  </span>
                  {supervisor}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">دپارتمان</span>
                <span className="font-bold text-black">{department}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">کارفرما</span>
                <span className="font-bold text-black flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#b90000] text-white flex items-center justify-center text-[10px]">
                    {employer ? employer.charAt(0) : "A"}
                  </span>
                  {employer}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">ددلاین پروژه</span>
                <span className="font-bold text-black">{deadline}</span>
              </div>
              {/* Status tag: regular active projects only */}
              {!isSuperProject && stage === "active" && (
                <div className="col-span-2">
                  <span className="text-gray-400 block mb-1">وضعیت پروژه</span>
                  <span
                    className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold inline-block ${statusBadgeStyle}`}
                  >
                    وضعیت : {status}
                  </span>
                </div>
              )}
            </div>

            {/* Project description - sourced from project data */}
            <div className="flex flex-col gap-1 text-right mt-2">
              <span className="text-gray-400 text-[12px]">توضیحات پروژه</span>
              <p className="text-[12px] text-gray-800 leading-relaxed font-light">
                {description || "توضیحاتی برای این پروژه ثبت نشده است."}
              </p>
            </div>
          </div>

          <div className="w-[1px] bg-gray-200 self-stretch" />

          {/* Left: amount box + primary action button */}
          <div className="w-[220px] shrink-0 flex flex-col gap-4">
            <div className="w-full bg-[#ebebeb] rounded-[5px] p-4 flex flex-col gap-3 text-right text-[12px]">
              <div>
                <span className="text-gray-500 block">مبلغ کل پروژه</span>
                <span className="text-[18px] font-bold text-black">
                  {formatPrice(budget)}{" "}
                  <span className="text-[11px] font-normal">تومان</span>
                </span>
              </div>

              {/* Paid amount: hidden for open (not-yet-assigned) projects */}
              {stage !== "open" && (
                <div className="border-t border-gray-300 pt-2">
                  <span className="text-gray-500 block">مبلغ پرداخت شده</span>
                  <span className="text-[14px] font-bold text-gray-700">
                    {formatPrice(paidAmount)}{" "}
                    <span className="text-[10px] font-normal">تومان</span>
                  </span>
                </div>
              )}
            </div>

            {/* ورودی قیمت و یادداشت برای ارسال پروپوزال (فقط در وضعیت Open و در صورتی که قبلا اعمال نکرده باشد) */}
            {stage === "open" && !readinessButton.disabled && (
              <div className="flex flex-col gap-3 w-full border border-gray-200 rounded-[5px] p-3 bg-gray-50">
                  <div className="text-right">
                      <label className="text-[10px] text-gray-500 block mb-1">پیشنهاد قیمت (تومان) - اختیاری</label>
                      <input 
                          type="number" 
                          value={proposedCost}
                          onChange={(e) => setProposedCost(e.target.value)}
                          placeholder={budget.toString()}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-[11px] font-mono text-left dir-ltr focus:border-black focus:outline-none"
                      />
                  </div>
                  <div className="text-right">
                      <label className="text-[10px] text-gray-500 block mb-1">یادداشت برای کارفرما - اختیاری</label>
                      <textarea 
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows="2"
                          placeholder="توضیحات پیشنهاد شما..."
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-[11px] focus:border-black focus:outline-none resize-none"
                      />
                  </div>
              </div>
            )}

            {stage === "open" && (
              <button
                onClick={handleApplyOrProposal}
                disabled={readinessButton.disabled || isSubmitting}
                className={`w-full h-[38px] border border-black text-[13px] font-bold rounded-[5px] transition-all 
                  ${readinessButton.disabled 
                    ? "bg-gray-100 text-gray-400 opacity-70 cursor-not-allowed border-gray-300" 
                    : "bg-[#1c1c1e] text-white shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none cursor-pointer hover:bg-black"}`}
              >
                {isSubmitting ? "در حال ثبت..." : (proposedCost || note) ? "ارسال پیشنهاد" : readinessButton.label}
              </button>
            )}

            {(stage === "completed" ||
              (stage === "active" && !isSuperProject)) && (
              <button
                onClick={() => openChat(project.ticketId || id, title)}
                className="w-full h-[38px] border border-black bg-white text-black text-[13px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:bg-gray-50"
              >
                <BiMessageSquareDetail className="text-base" />
                تیکت پروژه
              </button>
            )}
          </div>
        </div>

        {/* Progress bar: active super-projects only */}
        {isSuperProject && stage === "active" && (
          <div className="w-full border-t border-gray-100 pt-4 text-right">
            <div className="flex justify-between items-center text-[12px] mb-2">
              <span className="text-gray-400">مقدار پیشرفت پروژه</span>
              <span className="font-bold text-blue-600">{progress}٪</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Payments list: regular (non-super) active/completed projects */}
        {!isSuperProject && stage !== "open" && (
          <div className="w-full border-t border-gray-100 pt-4 text-right">
            <h4 className="text-[15px] font-bold text-black mb-3">
              لیست پرداختی ها
            </h4>

            <div className="w-full flex flex-col gap-2 text-[12px]">
              <div className="w-full flex justify-between text-gray-400 px-3 mb-1 font-medium">
                <span>عنوان پرداختی</span>
                <span className="w-[120px] text-center">مبلغ پرداختی</span>
                <span className="w-[100px] text-left">عملیات</span>
              </div>

              {payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="w-full bg-[#ebebeb] rounded-[5px] p-2.5 flex justify-between items-center px-3"
                  >
                    <span className="font-medium text-black">
                      {payment.title}
                    </span>
                    <span className="w-[120px] text-center font-bold text-black">
                      {formatPrice(payment.amount)} تومان
                    </span>
                    <div className="w-[100px] flex justify-end">
                      {stage === "active" ? (
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="h-[30px] px-3 bg-white border border-black rounded-[4px] shadow-[0_2px_0_0_#000000] text-[10px] font-bold text-black active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-1 hover:bg-gray-50 transition-colors"
                        >
                          <BiReceipt /> مشاهده فاکتور
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="h-[28px] px-4 bg-white border border-black rounded-[4px] shadow-[0_2px_0_0_#000000] text-[11px] font-bold text-black active:translate-y-[1px] active:shadow-none cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          جزئیات پرداخت
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-3">
                  پرداختی‌ای برای این پروژه ثبت نشده است.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sub-projects list: active super-projects only */}
        {isSuperProject && stage === "active" && (
          <div className="w-full border-t border-gray-100 pt-4 text-right">
            <h4 className="text-[15px] font-bold text-black mb-3">
              لیست پروژه ها
            </h4>

            <div className="w-full flex flex-col gap-2 text-[12px]">
              <div className="w-full flex justify-between text-gray-400 px-3 mb-1 font-medium">
                <span>عنوان پروژه</span>
                <span className="w-[120px] text-center">وضعیت</span>
                <span className="w-[100px] text-left">عملیات</span>
              </div>

              {subProjects && subProjects.length > 0 ? (
                subProjects.map((subProject) => (
                  <div
                    key={subProject.id}
                    className="w-full bg-[#ebebeb] rounded-[5px] p-2.5 flex justify-between items-center px-3"
                  >
                    <span className="font-bold text-black">
                      {subProject.title}
                    </span>
                    <span className="w-[120px] text-center text-gray-700 font-medium">
                      {subProject.status}
                    </span>
                    <div className="w-[100px] flex justify-end">
                      <button
                        onClick={() => handleViewSubProject(subProject)}
                        className="h-[28px] px-3 bg-white border border-black rounded-[4px] shadow-[0_2px_0_0_#000000] text-[11px] font-bold text-black active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-0.5 hover:bg-gray-50 transition-colors"
                      >
                        جزئیات پروژه <BiChevronLeft className="text-base" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-3">
                  زیرپروژه‌ای برای این ابرپروژه ثبت نشده است.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsModal;