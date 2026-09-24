import React, { useEffect, useState } from "react";
import { BiX, BiExport } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { getUserProfile, reviewProposal } from "../data/api";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

const ReviewFreelancerProposalModal = ({
  isOpen,
  onBack,
  freelancer,
  projectId,
}) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isOpen || !freelancer) return;
    getUserProfile(freelancer.id).then(setProfile);
  }, [isOpen, freelancer]);

  if (!isOpen || !freelancer) return null;

  // TODO(API): POST /projects/{projectId}/proposals/{freelancer.id}/decision
  const handleDecision = async (status) => {
    const result = await reviewProposal({
      projectId,
      freelancerId: freelancer.id,
      status,
    });

    if (!result.ok) {
      alert("ثبت تصمیم با خطا مواجه شد.");
      return;
    }

    alert(
      status === "accepted"
        ? "درخواست فریلنسر با موفقیت تایید شد."
        : "درخواست فریلنسر رد شد.",
    );
    onBack();
  };

  const handleNavigateToProject = (projId) => {
    onBack();
    navigate(`/supervisor-projects?id=${projId}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onBack} />

      <div
        className="w-[520px] bg-white border border-black rounded-[8px] p-6 relative z-10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto scrollbar-none select-none shadow-[0_8px_0_0_#000000]"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <div className="w-full flex justify-between items-center border-b border-gray-200 pb-3">
          <div className="w-10 h-10 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[18px]">
            {freelancer.initial || "?"}
          </div>
          <h3 className="text-[20px] font-bold text-black">اطلاعات کاربر</h3>
          <button
            type="button"
            onClick={onBack}
            className="text-gray-400 hover:text-black text-2xl cursor-pointer"
          >
            <BiX />
          </button>
        </div>

        <div className="flex flex-col gap-2 text-right">
          <h4 className="text-[13px] font-bold text-black">اطلاعات شخصی</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">نام</label>
              <input
                type="text"
                value={freelancer.firstName || ""}
                disabled
                className="w-full h-[36px] border border-black rounded px-3 text-[12px] bg-white text-right font-medium"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">نام خانوادگی</label>
              <input
                type="text"
                value={freelancer.lastName || ""}
                disabled
                className="w-full h-[36px] border border-black rounded px-3 text-[12px] bg-white text-right font-medium"
              />
            </div>
          </div>

          <div className="w-1/2 flex flex-col gap-1 mr-auto">
            <label className="text-[10px] text-gray-500">نام کاربری</label>
            <input
              type="text"
              value={freelancer.username || ""}
              disabled
              className="w-full h-[36px] border border-black rounded px-3 text-[12px] text-center font-mono bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 text-right border-t border-gray-200 pt-3">
          <h4 className="text-[13px] font-bold text-black">پروفایل فریلنسر</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">مجموع درآمد</label>
              <input
                type="text"
                value={`${formatPrice(freelancer.income)} تومان`}
                disabled
                className="w-full h-[36px] border border-black rounded px-3 text-[12px] bg-[#e5e7eb] text-center font-bold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">سطح</label>
              <input
                type="text"
                value={freelancer.level || ""}
                disabled
                className="w-full h-[36px] border border-black rounded px-3 text-[12px] bg-white text-right font-bold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <label className="text-[10px] text-gray-500">
              تگ‌های توانایی (دپارتمان)
            </label>
            <div className="w-full border border-black rounded p-2 bg-white flex flex-wrap gap-2">
              {(freelancer.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-[#dbeaff] text-[#1e40af] border border-blue-300 rounded px-2.5 py-0.5 text-[11px] font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-right border-t border-gray-200 pt-3">
          <h4 className="text-[13px] font-bold text-black">لیست پروژه ها</h4>
          <div className="w-full border border-black rounded p-2 bg-white flex flex-col gap-2">
            {(profile?.projects || []).map((p) => (
              <div
                key={p.id}
                className={`w-full h-[34px] border rounded px-3 flex justify-between items-center ${
                  p.isHighlighted
                    ? "bg-[#dbeaff] border-blue-300"
                    : "bg-[#e5e7eb] border-gray-300"
                }`}
              >
                <span
                  className={`text-[12px] text-black ${p.isHighlighted ? "font-bold" : "font-medium"}`}
                >
                  {p.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigateToProject(p.id)}
                  className="text-gray-700 hover:text-black cursor-pointer"
                >
                  <BiExport className="text-base" />
                </button>
              </div>
            ))}
            {profile && profile.projects?.length === 0 && (
              <div className="text-center text-gray-400 text-[11px] py-2">
                پروژه‌ای برای این فریلنسر ثبت نشده است.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full border-t border-gray-200 pt-3 mt-1">
          <button
            type="button"
            onClick={() => handleDecision("accepted")}
            className="h-[38px] bg-white border border-black text-black rounded-[5px] text-[12px] font-bold shadow-[0_3px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
          >
            تایید درخواست
          </button>
          <button
            type="button"
            onClick={() => handleDecision("rejected")}
            className="h-[38px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[12px] font-bold shadow-[0_3px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
          >
            رد درخواست
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewFreelancerProposalModal;
