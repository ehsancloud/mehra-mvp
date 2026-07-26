import React from "react";
import { useTicket } from "../context/TicketContext";
import { FaMoneyBillWave, FaBuilding, FaCalendarAlt } from "react-icons/fa";
import { getProjectStatusStyle } from "../utils/projectStatus";

const formatPersianPrice = (price) => {
  if (price === 0) return "۰";
  if (!price) return "۰";
  const formatted = price.toLocaleString("fa-IR");
  return formatted.replace(/٬/g, "،");
};

// Label + disabled state for the "اعلام آمادگی" button, driven by the
// project's applicationStatus. Once applied or rejected the button can
// no longer be clicked.
const getReadinessButtonState = (applicationStatus) => {
  if (applicationStatus === "applied") {
    return { label: "اعلام آمادگی شد", disabled: true };
  }
  if (applicationStatus === "rejected") {
    return { label: "رد شد", disabled: true };
  }
  return { label: "اعلام آمادگی", disabled: false };
};

const ProjectCard = ({
  project,
  currentTab,
  onDetailsClick,
  onDeclareReadiness,
}) => {
  const { openChat } = useTicket();

  const {
    id,
    title,
    budget,
    paidAmount,
    supervisor,
    department,
    employer,
    deadline,
    isSuperProject,
    progress,
    hasAccess,
    status,
    applicationStatus,
  } = project;

  const isOpenTab = currentTab === "open";
  const isActiveTab = currentTab === "active";
  const isCompletedTab = currentTab === "completed";

  const showProgressBar = isActiveTab && isSuperProject;

  // min-h instead of a fixed height so content never overflows the card
  const cardMinHeight = showProgressBar ? "min-h-[184px]" : "min-h-[154px]";

  const borderStyles = isSuperProject
    ? "border-[#3c78d3] shadow-[0_4px_0_0_#3c78d3]"
    : "border-black shadow-[0_4px_0_0_#000000]";

  const bgStyles = hasAccess ? "bg-white" : "bg-[#d1d1d1] opacity-90";

  const readinessButton = getReadinessButtonState(applicationStatus);
  const readinessDisabled = !hasAccess || readinessButton.disabled;

  const statusBadgeStyle = getProjectStatusStyle(status);

  return (
    <div
      dir="rtl"
      className={`
        border rounded-[5px] p-4 flex justify-between items-stretch w-[657px] select-none shrink-0 transition-all duration-200 relative
        ${cardMinHeight} ${borderStyles} ${bgStyles}
      `}
      style={{ fontFamily: "Pinar-FD" }}
    >
      {isSuperProject && (
        <div className="absolute -top-[13px] right-4 bg-[#3c78d3] text-white text-[11px] px-3 py-0.5 rounded-[4px] font-medium z-30 shadow-sm">
          ابر پروژه
        </div>
      )}

      {/* Right side: title + details */}
      <div className="flex-1 flex flex-col justify-between pr-2 pb-1">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-bold text-black text-right leading-snug">
            {title}
          </h2>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px] text-gray-700 mt-2">
            <div className="flex items-center gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                {supervisor ? supervisor.charAt(0) : "م"}
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-gray-500">
                  ناظر پروژه
                </span>
                <span className="font-medium text-black whitespace-nowrap">
                  {supervisor}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-[#b90000] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                {employer ? employer.charAt(0) : "ا"}
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-gray-500">کارفرما</span>
                <span className="font-medium text-black whitespace-nowrap">
                  {employer}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-start">
              <FaBuilding className="text-gray-500 text-sm shrink-0" />
              <div className="text-right">
                <span className="block text-[10px] text-gray-500">
                  دپارتمان
                </span>
                <span className="font-medium text-black whitespace-nowrap">
                  {department}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-start">
              <FaCalendarAlt className="text-gray-500 text-sm shrink-0" />
              <div className="text-right">
                <span className="block text-[10px] text-gray-500">
                  ددلاین پروژه
                </span>
                <span className="font-medium text-black whitespace-nowrap">
                  {deadline}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isActiveTab && !isSuperProject && (
          <div className="mt-3 flex justify-end">
            <span
              className={`text-[12px] px-3 py-1 rounded-[4px] font-medium shadow-sm ${statusBadgeStyle}`}
            >
              وضعیت : {status}
            </span>
          </div>
        )}

        {showProgressBar && (
          <div className="w-full flex flex-col gap-1.5 mt-4">
            <div className="flex justify-between items-center text-[12px] text-gray-500">
              <span
                className={`px-3 py-0.5 rounded-[4px] font-medium shadow-sm ${statusBadgeStyle}`}
              >
                وضعیت : {status}
              </span>
              <span className="text-black text-[11px]">مقدار پیشرفت پروژه</span>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-[12px] font-bold text-black">
                {progress.toLocaleString("fa-IR")}٪
              </span>
              <div className="flex-1 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3b82f6] rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-r border-gray-300 mx-4 self-stretch"></div>

      {/* Left side: amount box + action buttons */}
      <div className="flex flex-col justify-between items-center w-[207px] shrink-0">
        <div
          className={`w-full bg-[#ebebeb] border border-gray-300 rounded-[5px] p-2 flex flex-col justify-center relative ${isActiveTab ? "h-[95px]" : "h-[75px]"}`}
        >
          <FaMoneyBillWave className="absolute top-2 right-2 text-gray-700 text-sm" />
          <div className="text-center text-[11px] text-gray-600">
            مبلغ کل پروژه
          </div>
          <div className="text-center font-bold text-[18px] text-black mt-0.5">
            {formatPersianPrice(budget)}{" "}
            <span className="text-[11px] font-normal">تومان</span>
          </div>

          {isActiveTab && (
            <div className="border-t border-gray-300 mt-1 pt-1 flex flex-col items-center">
              <span className="text-[10px] text-gray-500">مبلغ پرداخت شده</span>
              <span className="text-[12px] font-medium text-gray-800">
                {formatPersianPrice(paidAmount)}{" "}
                <span className="text-[10px] font-normal text-gray-500">
                  تومان
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 w-full mt-3">
          {isOpenTab && (
            <>
              <button
                type="button"
                onClick={onDetailsClick}
                disabled={!hasAccess}
                className={`flex-1 h-[36px] border border-black rounded text-[13px] font-medium bg-[#1e1e1e] text-white ${hasAccess ? "cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[2px]" : "opacity-50 cursor-not-allowed"}`}
              >
                مشاهده جزئیات
              </button>
              <button
                type="button"
                onClick={() => onDeclareReadiness && onDeclareReadiness(project)}
                disabled={readinessDisabled}
                className={`flex-1 h-[36px] border border-black rounded text-[13px] font-medium bg-white text-black ${!readinessDisabled ? "cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[2px]" : "opacity-50 cursor-not-allowed"}`}
              >
                {readinessButton.label}
              </button>
            </>
          )}

          {(isActiveTab || isCompletedTab) && !isSuperProject && (
            <>
              <button
                type="button"
                onClick={onDetailsClick}
                className="flex-1 h-[36px] border border-black rounded text-[13px] font-medium bg-[#1e1e1e] text-white cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[2px]"
              >
                مشاهده جزئیات
              </button>
              <button
                type="button"
                onClick={() => openChat(id, title)}
                className="flex-1 h-[36px] border border-black rounded text-[13px] font-medium bg-white text-black cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[2px]"
              >
                تیکت پروژه
              </button>
            </>
          )}

          {(isActiveTab || isCompletedTab) && isSuperProject && (
            <button
              type="button"
              onClick={onDetailsClick}
              className="w-full h-[36px] border border-black rounded text-[13px] font-medium bg-[#1e1e1e] text-white cursor-pointer shadow-[0_2px_0_0_#000000] active:translate-y-[2px]"
            >
              مشاهده جزئیات
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
