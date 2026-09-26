import React, { useState } from "react";
import { BiX } from "react-icons/bi";
import { useTicket } from "../context/TicketContext";
import ReviewFreelancerProposalModal from "./ReviewFreelancerProposalModal";
import EditProjectModal from "./EditProjectModal";
import TerminateProjectModal from "./TerminateProjectModal";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

// Used by the Supervisor/Admin panel for a single project already assigned
// to a freelancer (drilled into directly, or as a sub-project of a super
// project via SuperProjectDetailsModal).
const ActiveProjectDetailsModal = ({ isOpen, onClose, projectData }) => {
  const { openChat } = useTicket();

  // Stacked popup state for the second-layer modals opened from here.
  const [activeStep, setActiveStep] = useState(null); // 'review' | 'edit' | 'terminate'
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);

  if (!isOpen || !projectData) return null;

  const handleOpenFreelancer = (f) => {
    setSelectedFreelancer(f);
    setActiveStep("review");
  };

  const handleOpenFreelancerChat = (f) => {
    const fTicket = projectData.ticketIds?.find(
      (t) => (t.userId?._id || t.userId)?.toString() === f.id?.toString()
    );
    const rawTicketId = f.ticketId || fTicket?.ticketId?._id || fTicket?.ticketId || projectData.ticketId || projectData.id;
    const ticketId = rawTicketId?._id || rawTicketId;
    openChat(ticketId, `${projectData.title} | ${f.firstName} ${f.lastName}`);
  };

  const handleOpenTicket = () => {
    openChat(projectData.ticketId || projectData.id, projectData.title);
  };

  const payments = projectData.payments || [];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-fadeIn ${
          activeStep ? "hidden" : "flex"
        }`}
        dir="rtl"
      >
        <div className="absolute inset-0" onClick={onClose} />

        <div
          className="w-[820px] bg-white border border-black rounded-[8px] p-6 relative z-10 flex flex-col gap-5 max-h-[92vh] overflow-y-auto scrollbar-none select-none shadow-[0_8px_0_0_#000000]"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-black text-2xl cursor-pointer"
          >
            <BiX />
          </button>

          <div className="grid grid-cols-12 gap-6 items-start mt-2">
            <div className="col-span-7 flex flex-col gap-4 text-right">
              <div>
                <h2 className="text-[22px] font-bold text-black mb-3 text-right">
                  {projectData.title}
                </h2>

                <div className="grid grid-cols-2 gap-y-3 text-[12px] text-gray-700 text-right">
                  <div className="flex items-center gap-2 justify-start">
                    <div className="w-7 h-7 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[11px]">
                      {projectData.supervisorInitial}
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-gray-400">
                        ناظر پروژه
                      </span>
                      <span className="font-bold text-black">
                        {projectData.supervisor}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-start">
                    <div className="w-7 h-7 rounded-full bg-[#b90000] text-white flex items-center justify-center font-bold text-[11px]">
                      {projectData.employerInitial}
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-gray-400">
                        کارفرما
                      </span>
                      <span className="font-bold text-black">
                        {projectData.employer}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] text-gray-400">
                      دپارتمان
                    </span>
                    <span className="font-bold text-black">
                      {projectData.department}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] text-gray-400">
                      ددلاین پروژه
                    </span>
                    <span className="font-bold text-black">
                      {projectData.deadline}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <span className="inline-block bg-[#def7ec] text-[#03543f] text-[11px] font-bold px-3 py-1 rounded-[4px]">
                    وضعیت : {projectData.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 text-right">
                <span className="block text-[11px] text-gray-400 mb-1">
                  توضیحات پروژه
                </span>
                <p className="text-[12px] text-gray-800 leading-relaxed text-right">
                  {projectData.description}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                <span className="text-[11px] text-gray-400 text-right block">
                  فریلنسر ها
                </span>

                {(projectData.freelancersList || []).map((f) => (
                  <div
                    key={f.id}
                    className="w-full h-[52px] border border-black rounded-[5px] px-3 flex justify-between items-center bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-3 text-[11px]">
                      <div className="w-7 h-7 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[10px]">
                        {f.initial}
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-gray-400">نام</span>
                        <span className="font-bold text-black">
                          {f.firstName}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-gray-400">
                          نام خانوادگی
                        </span>
                        <span className="font-bold text-black">
                          {f.lastName}
                        </span>
                      </div>
                      <div className="h-6 border-r border-gray-300 mx-1"></div>
                      <div className="flex flex-col text-center">
                        <span className="text-[9px] text-gray-400">سطح</span>
                        <span className="font-bold text-black">{f.level}</span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[9px] text-gray-400">امتیاز</span>
                        <span className="font-bold text-black">{f.rateScore ?? f.score ?? 0}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleOpenFreelancerChat(f)}
                        className="text-[9px] text-gray-500 hover:text-black hover:underline cursor-pointer"
                      >
                        هدایت به تیکت
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenFreelancer(f)}
                        className="h-[26px] px-4 bg-[#1c1c1e] text-white border border-black rounded-[4px] text-[11px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
                      >
                        مشاهده
                      </button>
                    </div>
                  </div>
                ))}

                {(projectData.freelancersList || []).length === 0 && (
                  <div className="text-center text-gray-400 text-[11px] py-2">
                    فریلنسری هنوز به این پروژه ارجاع نشده است.
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-5 flex flex-col gap-3">
              <div className="w-full bg-[#ebebeb] border border-gray-300 rounded-[5px] p-3 flex flex-col gap-2 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[11px] text-gray-600">
                    مبلغ کل پروژه
                  </span>
                  <span className="font-bold text-[18px] text-black">
                    {formatPrice(projectData.budget)}{" "}
                    <span className="text-[11px] font-normal">تومان</span>
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-1.5 flex flex-col items-center">
                  <span className="text-[10px] text-gray-500">
                    مبلغ پرداخت شده
                  </span>
                  <span className="font-bold text-[13px] text-black">
                    {formatPrice(projectData.paidAmount)} تومان
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenTicket}
                className="w-full h-[38px] bg-white text-black border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
              >
                تیکت پروژه
              </button>

              <button
                type="button"
                onClick={() => setActiveStep("terminate")}
                className="w-full h-[38px] bg-[#fecaca] text-[#dc2626] border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
              >
                اعلام مختومیت پروژه
              </button>

              <button
                type="button"
                onClick={() => setActiveStep("edit")}
                className="w-full h-[38px] bg-[#fecaca] text-[#dc2626] border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
              >
                ادیت اطلاعات پروژه
              </button>

              <div className="flex flex-col gap-1.5 text-right mt-2 border-t border-gray-200 pt-3">
                <span className="text-[12px] font-bold text-black block text-right">
                  لیست پرداختی ها
                </span>
                <div className="flex justify-between text-[10px] text-gray-400 px-1">
                  <span>مبلغ پرداختی</span>
                  <span>عنوان پرداختی</span>
                </div>
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="w-full bg-[#ebebeb] border border-gray-300 rounded-[5px] p-2.5 flex justify-between items-center text-[11px]"
                  >
                    <span className="font-bold text-black">
                      {formatPrice(payment.amount)} تومان
                    </span>
                    <span className="font-bold text-gray-800">
                      {payment.title}
                    </span>
                  </div>
                ))}
                {payments.length === 0 && (
                  <div className="text-center text-gray-400 text-[11px] py-2">
                    هنوز پرداختی برای این پروژه ثبت نشده است.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewFreelancerProposalModal
        isOpen={activeStep === "review"}
        onBack={() => setActiveStep(null)}
        freelancer={selectedFreelancer}
        projectId={projectData.id}
      />

      <EditProjectModal
        isOpen={activeStep === "edit"}
        onBack={() => setActiveStep(null)}
        projectData={projectData}
      />

      <TerminateProjectModal
        isOpen={activeStep === "terminate"}
        onClose={() => setActiveStep(null)}
        projectId={projectData.id}
        role="supervisor"
        onConfirm={onClose}
      />
    </>
  );
};

export default ActiveProjectDetailsModal;
