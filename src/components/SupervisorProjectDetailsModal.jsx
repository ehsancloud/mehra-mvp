import React, { useEffect, useState } from "react";
import { BiX } from "react-icons/bi";
import { useTicket } from "../context/TicketContext";
import AssignFreelancerModal from "./AssignFreelancerModal";
import ReviewFreelancerProposalModal from "./ReviewFreelancerProposalModal";
import EditProjectModal from "./EditProjectModal";
import TerminateProjectModal from "./TerminateProjectModal";
import { getProposalsForProject } from "../data/api";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

// Used by both the Supervisor and the Admin panel to review an open
// (not-yet-assigned) project and its incoming freelancer proposals.
const SupervisorProjectDetailsModal = ({ isOpen, onClose, projectData }) => {
  const { openChat } = useTicket();

  const [activeStep, setActiveStep] = useState(null); // 'assign' | 'review' | 'edit' | 'terminate'
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [canSendProposals, setCanSendProposals] = useState(true);
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    if (!isOpen || !projectData) return;
    setCanSendProposals(projectData.canSendProposals ?? true);
    getProposalsForProject(projectData.id).then(setProposals);
  }, [isOpen, projectData]);

  if (!isOpen || !projectData) return null;

  const handleOpenAssign = () => setActiveStep("assign");

  const handleOpenProposal = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setActiveStep("review");
  };

  const handleOpenEdit = () => setActiveStep("edit");

  const handleNavigateToTicket = () => {
    if (projectData.ticketId || projectData.id) {
      openChat(projectData.ticketId || projectData.id, projectData.title);
    } else {
      alert("تیکت مرتبطی برای این پروژه یافت نشد.");
    }
  };

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
          className="w-[780px] bg-white border border-black rounded-[8px] p-6 relative z-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto scrollbar-none select-none shadow-[0_8px_0_0_#000000]"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-black text-2xl cursor-pointer"
          >
            <BiX />
          </button>

          {/* 2-column layout: details on the right, price/actions on the left */}
          <div className="grid grid-cols-12 gap-6 items-start mt-2">
            <div className="col-span-8 flex flex-col gap-4 text-right">
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
                    وضعیت: {projectData.status || "در انتظار ارجاع"}
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

              <div className="border-t border-gray-200 pt-3 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold text-black">
                    لیست پیشنهاد های فریلنسر ها
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">
                      امکان ارسال پیشنهاد
                    </span>
                    <button
                      type="button"
                      onClick={() => setCanSendProposals(!canSendProposals)}
                      className={`w-9 h-5 rounded-full transition-all relative ${
                        canSendProposals ? "bg-green-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                          canSendProposals ? "right-1" : "right-5"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto scrollbar-none">
                  {proposals.map((f) => (
                    <div
                      key={f.id}
                      className="w-full h-[52px] border border-black rounded-[5px] px-3 flex justify-between items-center bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenProposal(f)}
                        className="h-[32px] px-4 bg-[#1c1c1e] text-white border border-black rounded-[4px] text-[11px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
                      >
                        مشاهده
                      </button>

                      <div
                        onClick={() => handleOpenProposal(f)}
                        className="flex items-center gap-4 text-[11px] cursor-pointer"
                      >
                        <div className="flex flex-col text-center">
                          <span className="text-[9px] text-gray-400">
                            امتیاز
                          </span>
                          <span className="font-bold text-black">
                            {f.rateScore}
                          </span>
                        </div>
                        <div className="flex flex-col text-center">
                          <span className="text-[9px] text-gray-400">سطح</span>
                          <span className="font-bold text-black">
                            {f.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] text-gray-400">
                              نام خانوادگی
                            </span>
                            <span className="font-bold text-black">
                              {f.lastName}
                            </span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] text-gray-400">
                              نام
                            </span>
                            <span className="font-bold text-black">
                              {f.firstName}
                            </span>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[10px]">
                            {f.initial}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {proposals.length === 0 && (
                    <div className="text-center text-gray-400 text-[11px] py-3">
                      هنوز پیشنهادی برای این پروژه ثبت نشده است.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-4 flex flex-col gap-3">
              <div className="w-full bg-[#ebebeb] border border-gray-300 rounded-[5px] p-3 flex flex-col justify-center text-center h-[90px]">
                <span className="text-[11px] text-gray-600">مبلغ کل پروژه</span>
                <div className="font-bold text-[20px] text-black mt-1">
                  {formatPrice(projectData.budget)}{" "}
                  <span className="text-[12px] font-normal">تومان</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAssign}
                className="w-full h-[38px] bg-white text-black border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
              >
                ارجاء
              </button>

              <button
                type="button"
                onClick={handleNavigateToTicket}
                className="w-full h-[38px] bg-white text-black border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
              >
                هدایت به تیکت پروژه
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
                onClick={handleOpenEdit}
                className="w-full h-[38px] bg-[#fecaca] text-[#dc2626] border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
              >
                ادیت اطلاعات پروژه
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up popups */}
      <AssignFreelancerModal
        isOpen={activeStep === "assign"}
        onBack={() => setActiveStep(null)}
        projectId={projectData.id}
        onSelectFreelancer={(freelancer) => {
          setSelectedFreelancer(freelancer);
          setActiveStep("review");
        }}
      />

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

export default SupervisorProjectDetailsModal;
