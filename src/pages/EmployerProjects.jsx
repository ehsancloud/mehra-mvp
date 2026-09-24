import React, { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import EmployerProjectDetailsModal from "../components/EmployerProjectDetailsModal";
import { useTicket } from "../context/TicketContext";
import { getProjects } from "../data/api";
import { useAuthStore } from "../store/authStore";
const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

const EmployerProjects = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const { openChat } = useTicket();

  
// داخل کامپوننت:
  const { user: currentEmployer } = useAuthStore();
  const employerId = currentEmployer?.id;

  useEffect(() => {
    getProjects({ employerId, stage: activeTab }).then(setProjects);
  }, [employerId, activeTab]);

  const handleOpenDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleProjectUpdated = (updatedProject) => {
    setSelectedProject(updatedProject);
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    );
  };

  return (
    <div
      className="flex h-screen w-full flex-col bg-gray-50 overflow-hidden"
      dir="rtl"
    >
      <header className="w-full flex justify-between items-center px-12 py-6 shrink-0 select-none">
        <h1
          className="text-[32px] font-bold text-[#1c1c1e]"
          style={{ fontFamily: "Pinar-FD" }}
        >
          پروژه ها
        </h1>
        <UserHeader userInitial={currentEmployer?.initial} hasNotification={true} />
      </header>

      <div className="flex-1 w-full flex flex-col items-center overflow-hidden">
        <div
          className="relative h-[54px] bg-[#eef0f2] border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-1 flex items-center w-[657px] mb-6 shrink-0 select-none"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[20px] cursor-pointer z-10 ${activeTab === "active" ? "bg-white text-black font-bold shadow-sm" : "text-[#4a4a4a]"}`}
          >
            فعال
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[20px] cursor-pointer z-10 ${activeTab === "completed" ? "bg-white text-black font-bold shadow-sm" : "text-[#4a4a4a]"}`}
          >
            انجام شده
          </button>
        </div>

        <div className="w-[657px] flex-1 overflow-y-auto pr-1 pl-1 flex flex-col items-center gap-6 scrollbar-none pb-12">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project.id}
                className={`
                  w-[657px] bg-white border rounded-[5px] p-4 flex flex-col gap-4 select-none shrink-0 relative
                  ${project.isSuperProject ? "border-[#3b82f6] shadow-[0_4px_0_0_#3b82f6]" : "border-black shadow-[0_4px_0_0_#000000]"}
                  ${project.isSuperProject ? "min-h-[184px]" : "min-h-[154px]"}
                `}
                style={{ fontFamily: "Pinar-FD" }}
              >
                {project.isSuperProject && (
                  <span className="absolute -top-[13px] right-6 bg-[#3b82f6] text-white text-[11px] font-bold px-3 py-0.5 rounded-[4px] z-10">
                    ابر پروژه
                  </span>
                )}

                <div className="w-full flex justify-between items-stretch flex-1">
                  <div className="flex-1 flex flex-col justify-between pr-2 pb-1 text-right">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[20px] font-bold text-black leading-snug">
                        {project.title}
                      </h2>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px] text-gray-700 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[11px]">
                            {project.supervisorInitial}
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-500">
                              ناظر پروژه
                            </span>
                            <span className="font-medium text-black whitespace-nowrap">
                              {project.supervisor}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#b90000] text-white flex items-center justify-center font-bold text-[11px]">
                            {project.employerInitial}
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-500">
                              کارفرما
                            </span>
                            <span className="font-medium text-black whitespace-nowrap">
                              {project.employer}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-gray-500">
                            دپارتمان
                          </span>
                          <span className="font-medium text-black">
                            {project.department}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-gray-500">
                            ددلاین پروژه
                          </span>
                          <span className="font-medium text-black">
                            {project.deadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-right">
                      <span className="bg-[#def7ec] text-[#03543f] text-[11px] px-3 py-1 rounded-[4px] font-bold inline-block">
                        وضعیت : {project.employerStatus}
                      </span>
                    </div>
                  </div>

                  <div className="border-r border-gray-300 mx-4 self-stretch"></div>

                  <div className="flex flex-col justify-between items-center w-[207px] shrink-0">
                    <div className="w-full bg-[#ebebeb] border border-gray-300 rounded-[5px] p-2 flex flex-col justify-center text-center h-[85px]">
                      <span className="text-[11px] text-gray-600">
                        مبلغ کل پروژه
                      </span>
                      <div className="font-bold text-[18px] text-black mt-0.5">
                        {formatPrice(project.budget)}{" "}
                        <span className="text-[11px] font-normal">تومان</span>
                      </div>
                      {activeTab === "active" && (
                        <div className="text-[9px] text-gray-500 border-t border-gray-200 mt-1 pt-0.5">
                          مبلغ پرداخت شده: {formatPrice(project.paidAmount)} تومان
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 w-full mt-2">
                      {project.isSuperProject ? (
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(project)}
                          className="w-full h-[36px] border border-black rounded text-[13px] font-bold bg-[#1e1e1e] text-white cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all text-center"
                        >
                          مشاهده جزئیات
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(project)}
                            className="flex-1 h-[36px] border border-black rounded text-[13px] font-bold bg-[#1e1e1e] text-white cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all text-center"
                          >
                            مشاهده جزئیات
                          </button>
                          <button
                            type="button"
                            onClick={() => openChat(project.ticketId || project.id, project.title)}
                            className="flex-1 h-[36px] border border-black rounded text-[12px] font-bold bg-white text-black cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all text-center"
                          >
                            تیکت پروژه
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {project.isSuperProject && activeTab === "active" && (
                  <div className="w-full border-t border-gray-100 pt-3 text-right">
                    <div className="flex justify-between items-center text-[11px] text-gray-500 mb-1">
                      <span className="text-gray-400">مقدار پیشرفت پروژه</span>
                      <span className="font-bold text-[#3b82f6]">
                        {project.progress} ٪
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3b82f6] rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                )}
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

      <EmployerProjectDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
        onUpdated={handleProjectUpdated}
      />
    </div>
  );
};

export default EmployerProjects;
