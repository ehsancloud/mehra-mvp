import React, { useEffect, useState } from "react";
import { BiX } from "react-icons/bi";
import { getUsers, assignFreelancer, getProjectById } from "../data/api";
import { getLevelLabel } from "../utils/projectLevels";

const AssignFreelancerModal = ({
  isOpen,
  onBack,
  projectId,
  project,
  departmentId,
  department,
  onSelectFreelancer,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [freelancers, setFreelancers] = useState([]);
  const [assigningFreelancerId, setAssigningFreelancerId] = useState(null);
  const [proposedCost, setProposedCost] = useState("");
  const [assignedFreelancerIds, setAssignedFreelancerIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProject, setCurrentProject] = useState(project || null);
  const [showAllFreelancers, setShowAllFreelancers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAssigningFreelancerId(null);
      setProposedCost("");
      setShowAllFreelancers(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      let proj = project;
      if (!proj && projectId) {
        proj = await getProjectById(projectId);
      }
      if (isMounted && proj) {
        setCurrentProject(proj);
      }

      const targetDeptId = departmentId || proj?.departmentId;
      const targetDeptName = department || proj?.department;

      const params = {
        role: "freelancer",
        projectId: projectId || proj?.id,
      };

      if (!showAllFreelancers && (targetDeptId || targetDeptName)) {
        if (targetDeptId) params.departmentId = targetDeptId;
        if (targetDeptName && targetDeptName !== "تعیین نشده") params.department = targetDeptName;
      }

      const list = await getUsers(params);
      if (isMounted) {
        setFreelancers(
          list.map((f) => ({
            ...f,
            levelLabel: getLevelLabel(f.level),
          }))
        );
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, projectId, project, departmentId, department, showAllFreelancers]);

  if (!isOpen) return null;

  const filteredFreelancers = freelancers.filter((f) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      f.firstName.toLowerCase().includes(query) ||
      f.lastName.toLowerCase().includes(query) ||
      f.username.toLowerCase().includes(query)
    );
  });

  const handleStartAssign = (e, f) => {
    e.stopPropagation();
    setAssigningFreelancerId(f.id || f._id);
    setProposedCost("");
  };

  const handleCancelAssign = (e) => {
    e.stopPropagation();
    setAssigningFreelancerId(null);
    setProposedCost("");
  };

  const handleConfirmAssign = async (e, f) => {
    e.stopPropagation();
    setIsSubmitting(true);
    const parsedCost = proposedCost ? Number(proposedCost) : undefined;
    const result = await assignFreelancer({
      projectId: projectId || currentProject?.id,
      freelancerId: f.id || f._id,
      proposedCost: parsedCost,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      alert("ارجاع پروژه با خطا مواجه شد: " + (result.message || ""));
      return;
    }

    alert(`پروژه با موفقیت به ${f.firstName} ${f.lastName} ارجاء داده شد.`);
    setAssignedFreelancerIds((prev) => [...prev, f.id || f._id]);
    setAssigningFreelancerId(null);
    setProposedCost("");
  };

  const activeDeptName = currentProject?.department || department;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onBack} />

      <div
        className="w-[620px] bg-white border border-black rounded-[8px] p-6 relative z-10 flex flex-col gap-4 select-none shadow-[0_8px_0_0_#000000]"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <div className="flex flex-col text-right">
            <h3 className="text-[18px] font-bold text-black text-right">
              ارجاء به فریلنسر
            </h3>
            <span className="text-[11px] text-gray-500 text-right">
              {activeDeptName
                ? `لیست فریلنسرهای دپارتمان ${activeDeptName}`
                : "لیست فریلنسرها"}
            </span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-gray-400 hover:text-black text-2xl cursor-pointer"
          >
            <BiX />
          </button>
        </div>

        {activeDeptName && (
          <div className="flex justify-between items-center px-1 text-[11px] text-gray-600">
            <span>
              {showAllFreelancers
                ? "در حال نمایش تمامی فریلنسرها"
                : `فیلتر شده بر اساس دپارتمان ${activeDeptName}`}
            </span>
            <button
              type="button"
              onClick={() => setShowAllFreelancers(!showAllFreelancers)}
              className="text-blue-600 hover:underline cursor-pointer font-bold"
            >
              {showAllFreelancers ? "نمایش فقط فریلنسرهای این دپارتمان" : "نمایش همه فریلنسرها"}
            </button>
          </div>
        )}

        <div className="w-full flex gap-2">
          <button
            type="button"
            className="w-[80px] h-[36px] bg-white text-black border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] cursor-pointer"
          >
            جستجو
          </button>
          <input
            type="text"
            placeholder="مشخصات فریلنسر مورد نظر"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-[36px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none placeholder-gray-400 text-right"
          />
        </div>

        {/* Freelancer rows - the whole row opens the profile, the button assigns directly */}
        <div className="flex flex-col gap-3 mt-1 max-h-[260px] overflow-y-auto scrollbar-none pr-1">
          {filteredFreelancers.map((f) => (
            <div
              key={f.id}
              onClick={() => onSelectFreelancer && onSelectFreelancer(f)}
              className="w-full h-[54px] border border-black rounded-[5px] px-4 flex justify-between items-center bg-white shadow-sm hover:bg-gray-50 cursor-pointer transition-all shrink-0"
            >
              {assignedFreelancerIds.includes(f.id || f._id) ? (
                <span className="h-[32px] px-3 bg-[#def7ec] text-[#03543f] border border-[#03543f] rounded-[4px] text-[11px] font-bold flex items-center justify-center">
                  ارجاع شد ✓
                </span>
              ) : assigningFreelancerId === (f.id || f._id) ? (
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="number"
                    placeholder="مبلغ پیشنهادی (تومان)"
                    value={proposedCost}
                    onChange={(e) => setProposedCost(e.target.value)}
                    className="w-[140px] h-[32px] border border-black rounded-[4px] px-2 text-[11px] font-mono text-right bg-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={(e) => handleConfirmAssign(e, f)}
                    className="h-[32px] px-3 bg-[#1c1c1e] text-white border border-black rounded-[4px] text-[11px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "..." : "تایید"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAssign}
                    className="h-[32px] px-2.5 bg-gray-200 text-black border border-gray-400 rounded-[4px] text-[11px] font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleStartAssign(e, f)}
                  className="h-[32px] px-5 bg-[#1c1c1e] text-white border border-black rounded-[4px] text-[11px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
                >
                  ارجاء
                </button>
              )}

              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex flex-col text-center">
                  <span className="text-[9px] text-gray-400">نام کاربری</span>
                  <span className="font-bold text-black font-mono">
                    {f.username}
                  </span>
                </div>
                <div className="h-6 border-r border-gray-300"></div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-gray-400">
                      نام خانوادگی
                    </span>
                    <span className="font-bold text-black">{f.lastName}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-gray-400">نام</span>
                    <span className="font-bold text-black">{f.firstName}</span>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-[12px]"
                    style={{ backgroundColor: f.avatarColor || "#3b82f6" }}
                  >
                    {f.initial}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredFreelancers.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-gray-400 text-[12px]">
              <span>
                {showAllFreelancers
                  ? "فریلنسری با این مشخصات یافت نشد."
                  : activeDeptName
                  ? `فریلنسری در دپارتمان «${activeDeptName}» یافت نشد.`
                  : "فریلنسری یافت نشد."}
              </span>
              {!showAllFreelancers && activeDeptName && (
                <button
                  type="button"
                  onClick={() => setShowAllFreelancers(true)}
                  className="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  مشاهده همه فریلنسرها
                </button>
              )}
            </div>
          )}
          {isLoading && (
            <div className="text-center text-gray-400 text-[12px] py-6">
              در حال بارگذاری لیست فریلنسرها...
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full h-[36px] border border-black bg-white text-black text-[12px] font-bold rounded-[5px] mt-2 shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
        >
          بازگشت
        </button>
      </div>
    </div>
  );
};

export default AssignFreelancerModal;
