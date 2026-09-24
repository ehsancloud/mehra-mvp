import React, { useEffect, useState } from "react";
import ProjectTabs from "../components/ProjectTabs";
import ProjectCard from "../components/ProjectCard";
import UserHeader from "../components/UserHeader";
import ProjectDetailsModal from "../components/ProjectDetailsModal";
import { canAccessProjectLevel } from "../utils/projectLevels";
import {
  getProjects,
  declareReadiness,
} from "../data/api";
import { useAuthStore } from "../store/authStore";

const FreelancerProjects = () => {
  const [currentTab, setCurrentTab] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  const { user: currentFreelancer } = useAuthStore();
  const freelancerId = currentFreelancer?.id;

  useEffect(() => {
    getProjects({ freelancerId }).then(setProjects);
  }, [freelancerId]);

  // Only the "open" (unassigned) pool is gated by level - once a project
  // is active/completed the freelancer already has access to it.
  const projectsWithAccess = projects.map((project) => ({
    ...project,
    hasAccess:
      project.stage === "open"
        ? canAccessProjectLevel(project.level, currentFreelancer?.level)
        : true,
  }));

  const filteredProjects = projectsWithAccess.filter(
    (project) => project.stage === currentTab,
  );
  const sortedProjects = [...filteredProjects].sort(
    (a, b) => Number(a.hasAccess) - Number(b.hasAccess),
  );

  const handleOpenDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // Called from the "اعلام آمادگی" (declare readiness) button on both the
  // project card and the details modal.
  const handleDeclareReadiness = async (project) => {
    const result = await declareReadiness({
      projectId: project.id,
      freelancerId,
    });
    if (result.ok) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, applicationStatus: "applied" } : p,
        ),
      );
    }
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
          پروژه‌ها
        </h1>
        <UserHeader userInitial={currentFreelancer?.initial} hasNotification={true} />
      </header>

      <div className="flex-1 w-full flex flex-col items-center overflow-hidden">
        <div className="z-20 mb-6 shrink-0">
          <ProjectTabs onChange={(tabId) => setCurrentTab(tabId)} />
        </div>

        <div className="w-[657px] flex-1 overflow-y-auto pr-1 pl-1 flex flex-col items-center gap-6 scrollbar-none pb-12">
          {sortedProjects.length > 0 ? (
            sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentTab={currentTab}
                onDetailsClick={() => handleOpenDetails(project)}
                onDeclareReadiness={() => handleDeclareReadiness(project)}
              />
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

      <ProjectDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
        onDeclareReadiness={handleDeclareReadiness}
      />
    </div>
  );
};

export default FreelancerProjects;
