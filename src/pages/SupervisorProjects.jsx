import React, { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import CreateProjectModal from "../components/CreateProjectModal";
import SupervisorProjectDetailsModal from "../components/SupervisorProjectDetailsModal";
import ArchivedProjectDetailsModal from "../components/ArchivedProjectDetailsModal";
import ActiveProjectDetailsModal from "../components/ActiveProjectDetailsModal";
import SuperProjectDetailsModal from "../components/SuperProjectDetailsModal";
import AssignFreelancerModal from "../components/AssignFreelancerModal";
import ReviewFreelancerProposalModal from "../components/ReviewFreelancerProposalModal";
import { useTicket } from "../context/TicketContext";
import { BiPlus } from "react-icons/bi";
import { getProjects} from "../data/api";
import { useAuthStore } from "../store/authStore";
const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

const SupervisorProjects = () => {
  const { openChat } = useTicket();

  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);

  // Popup / modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
  const [isActiveDetailsModal, setIsActiveDetailsModal] = useState(false);
  const [isSuperProjectModal, setIsSuperProjectModal] = useState(false);
  const [isArchivedDetailsOpen, setIsArchivedDetailsOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isProposalReviewOpen, setIsProposalReviewOpen] = useState(false);

  const { user: currentSupervisor } = useAuthStore();
  const supervisorId = currentSupervisor?.id;
  const loadProjects = () => {
    if (activeTab === "archived") {
      // The supervisor/admin "archived" tab covers both recently completed
      // and fully archived projects - the employer panel is the one that
      // only distinguishes active vs. completed.
      Promise.all([
        getProjects({ supervisorId, stage: "completed", query: searchQuery }),
        getProjects({ supervisorId, stage: "archived", query: searchQuery }),
      ]).then(([completed, archived]) => setProjects([...completed, ...archived]));
    } else {
      getProjects({ supervisorId, stage: activeTab, query: searchQuery }).then(
        setProjects,
      );
    }
  };

  useEffect(loadProjects, [supervisorId, activeTab, searchQuery]);

  const handleOpenDetails = (project) => {
    setSelectedProject(project);
    if (project.stage === "archived" || project.stage === "completed") {
      setIsArchivedDetailsOpen(true);
    } else if (project.stage === "active") {
      if (project.isSuperProject) {
        setIsSuperProjectModal(true);
      } else {
        setIsActiveDetailsModal(true);
      }
    } else {
      setIsOpenDetailsModal(true);
    }
  };

  return (
    <div
      className="flex h-screen w-full flex-col bg-gray-50 overflow-hidden relative"
      dir="rtl"
    >
      <header className="w-full flex justify-between items-center px-12 py-6 shrink-0 select-none">
        <h1
          className="text-[32px] font-bold text-[#1c1c1e]"
          style={{ fontFamily: "Pinar-FD" }}
        >
          پروژه ها
        </h1>
        <UserHeader userInitial={currentSupervisor?.initial} hasNotification={true} />
      </header>

      <div className="flex-1 w-full flex flex-col items-center overflow-hidden">
        <div
          className="relative h-[54px] bg-[#eef0f2] border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-1 flex items-center w-[657px] mb-4 shrink-0 select-none"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <button
            onClick={() => {
              setActiveTab("active");
              setSearchQuery("");
            }}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[18px] cursor-pointer z-10 ${
              activeTab === "active"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#4a4a4a]"
            }`}
          >
            فعال
          </button>
          <button
            onClick={() => {
              setActiveTab("archived");
              setSearchQuery("");
            }}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[18px] cursor-pointer z-10 ${
              activeTab === "archived"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#4a4a4a]"
            }`}
          >
            بایگانی
          </button>
          <button
            onClick={() => {
              setActiveTab("open");
              setSearchQuery("");
            }}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[18px] cursor-pointer z-10 ${
              activeTab === "open"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#4a4a4a]"
            }`}
          >
            پروژه های باز
          </button>
        </div>

        <div
          className="w-[657px] flex gap-2 mb-6 shrink-0 select-none"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <button
            type="button"
            className="w-[100px] h-[38px] bg-white text-black border border-black rounded-[5px] shadow-[0_2px_0_0_#000000] text-[13px] font-bold cursor-pointer"
          >
            جستجو
          </button>
          <input
            type="text"
            placeholder={
              activeTab === "active"
                ? "مشخصات پروژه فعال مورد نظر"
                : activeTab === "archived"
                  ? "مشخصات پروژه بایگانی مورد نظر"
                  : "مشخصات پروژه باز مورد نظر"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-[38px] bg-white border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none placeholder-gray-400 text-right"
          />
        </div>

        <div className="w-[657px] flex-1 overflow-y-auto pr-1 pl-1 flex flex-col items-center gap-6 scrollbar-none pb-24">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project.id}
                className={`w-[657px] bg-white border rounded-[5px] shadow-[0_4px_0_0_#000000] p-4 flex justify-between items-stretch select-none shrink-0 relative transition-all hover:translate-y-[1px]
                  ${project.isSuperProject ? "border-[#3b82f6]" : "border-black"}
                `}
                style={{ fontFamily: "Pinar-FD" }}
              >
                {project.isSuperProject && (
                  <span className="absolute -top-[12px] right-4 bg-[#3b82f6] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-[3px]">
                    ابر پروژه
                  </span>
                )}

                <div className="flex-1 flex flex-col justify-between pr-2 pb-1 text-right">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[20px] font-bold text-black leading-snug">
                      {project.title}
                    </h2>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px] text-gray-700 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[11px]">
                          {project.supervisorInitial}
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-400">
                            ناظر پروژه
                          </span>
                          <span className="font-bold text-black whitespace-nowrap">
                            {project.supervisor}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#b90000] text-white flex items-center justify-center font-bold text-[11px]">
                          {project.employerInitial}
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-400">
                            کارفرما
                          </span>
                          <span className="font-bold text-black whitespace-nowrap">
                            {project.employer}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] text-gray-400">
                          دپارتمان
                        </span>
                        <span className="font-bold text-black">
                          {project.department}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] text-gray-400">
                          {project.freelancersText
                            ? "فریلنسرها"
                            : "ددلاین پروژه"}
                        </span>
                        <span className="font-bold text-black">
                          {project.freelancersText || project.deadline}
                        </span>
                      </div>
                    </div>

                    {project.status && (
                      <div className="mt-2 text-right">
                        <span className="inline-block bg-[#def7ec] text-[#03543f] text-[10px] font-bold px-2 py-0.5 rounded">
                          وضعیت : {project.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {project.stage === "open" && (
                    <div className="mt-2 text-right">
                      <span className="block text-[10px] text-gray-400">
                        وضعیت پیشنهادات
                      </span>
                      <span className="font-bold text-black text-[12px]">
                        {project.proposalStatus}
                      </span>
                    </div>
                  )}

                  {project.isSuperProject && (
                    <div className="mt-3 flex flex-col gap-1 text-right">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-black">
                          {project.progress || 0}%
                        </span>
                        <span className="text-gray-400">
                          مقدار پیشرفت پروژه
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3b82f6] rounded-full"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-r border-gray-300 mx-4 self-stretch"></div>

                <div className="flex flex-col justify-between items-center w-[200px] shrink-0">
                  <div className="w-full bg-[#ebebeb] border border-gray-300 rounded-[5px] p-2 flex flex-col justify-center text-center h-[85px]">
                    <span className="text-[10px] text-gray-600">
                      مبلغ کل پروژه
                    </span>
                    <div className="font-bold text-[16px] text-black mt-0.5">
                      {formatPrice(project.budget)}{" "}
                      <span className="text-[10px] font-normal">تومان</span>
                    </div>
                    {project.paidAmount !== undefined && (
                      <span className="text-[9px] text-gray-500 mt-1 border-t border-gray-300 pt-0.5">
                        مبلغ پرداخت شده : {formatPrice(project.paidAmount)}{" "}
                        تومان
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 w-full mt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(project)}
                      className={`h-[36px] border border-black rounded text-[12px] font-bold bg-[#1e1e1e] text-white cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[1px] text-center
                        ${project.isSuperProject ? "w-full" : "flex-1"}
                      `}
                    >
                      مشاهده جزئیات
                    </button>

                    {!project.isSuperProject && project.stage === "open" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsAssignModalOpen(true);
                        }}
                        className="flex-1 h-[36px] border border-black rounded text-[12px] font-bold bg-white text-black cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[1px] text-center"
                      >
                        ارجاء
                      </button>
                    )}

                    {!project.isSuperProject &&
                      (project.stage === "archived" ||
                        project.stage === "completed" ||
                        project.stage === "active") && (
                        <button
                          type="button"
                          onClick={() => openChat(project.ticketId || project.id, project.title)}
                          className="flex-1 h-[36px] border border-black rounded text-[12px] font-bold bg-white text-black cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[1px] text-center"
                        >
                          تیکت پروژه
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p
              className="text-gray-500 mt-10"
              style={{ fontFamily: "Pinar-FD" }}
            >
              پروژه‌ای در این بخش وجود ندارد.
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsCreateModalOpen(true)}
        className="absolute bottom-6 right-6 w-12 h-12 bg-white border border-black rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-[0_4px_0_0_#000000] hover:translate-y-[1px] cursor-pointer z-40"
      >
        <BiPlus />
      </button>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={loadProjects}
      />

      <SupervisorProjectDetailsModal
        isOpen={isOpenDetailsModal}
        onClose={() => {
          setIsOpenDetailsModal(false);
          loadProjects();
        }}
        projectData={selectedProject}
      />

      <ActiveProjectDetailsModal
        isOpen={isActiveDetailsModal}
        onClose={() => {
          setIsActiveDetailsModal(false);
          loadProjects();
        }}
        projectData={selectedProject}
      />

      <SuperProjectDetailsModal
        isOpen={isSuperProjectModal}
        onClose={() => setIsSuperProjectModal(false)}
        superProjectData={selectedProject}
      />

      <ArchivedProjectDetailsModal
        isOpen={isArchivedDetailsOpen}
        onClose={() => setIsArchivedDetailsOpen(false)}
        projectData={selectedProject}
        onOpenFreelancerProfile={(freelancer) => {
          setSelectedFreelancer(freelancer);
          setIsProposalReviewOpen(true);
        }}
      />

      <AssignFreelancerModal
        isOpen={isAssignModalOpen}
        onBack={() => {
          setIsAssignModalOpen(false);
          loadProjects();
        }}
        projectId={selectedProject?.id}
      />

      <ReviewFreelancerProposalModal
        isOpen={isProposalReviewOpen}
        onBack={() => setIsProposalReviewOpen(false)}
        freelancer={selectedFreelancer}
        projectId={selectedProject?.id}
      />
    </div>
  );
};

export default SupervisorProjects;
