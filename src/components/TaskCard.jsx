import React from "react";
import { BiLinkExternal } from "react-icons/bi";
import { useTicket } from "../context/TicketContext";

// Maps a status label to its badge color. Backend only sends the label
// (statusText); the frontend owns how it's styled. Every task should
// have one of exactly these three statuses.
const getStatusStyle = (statusText) => {
  const map = {
    "تایید شده": "bg-green-100 text-green-700",
    "در حال بررسی": "bg-blue-100 text-blue-700",
    "رد شده": "bg-red-100 text-red-700",
  };
  return map[statusText] || "bg-gray-100 text-gray-700";
};

const TaskCard = ({ task, columnType }) => {
  const { openChat } = useTicket();
  const {
    title,
    department,
    duration,
    statusText,
    start_date,
    last_update,
    employerApproval,
    relatedTicketId,
  } = task;

  const handleGoToTicket = (e) => {
    e.preventDefault();
    if (relatedTicketId) {
      openChat(relatedTicketId, title);
    }
  };

  return (
    <div
      className="w-full bg-white border border-gray-300 rounded-[5px] p-3 flex flex-col gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.02)] select-none shrink-0"
      style={{ fontFamily: "Pinar-FD" }}
    >
      <h4 className="text-[15px] font-bold text-black text-right">{title}</h4>

      <div className="flex flex-col gap-1.5 text-[11px] text-gray-500 text-right mt-1">
        {department && (
          <div>
            <span>دپارتمان: </span>
            <span className="text-black font-medium">{department}</span>
          </div>
        )}

        {duration && (
          <div>
            <span>مدت زمان: </span>
            <span className="text-black font-medium">{duration}</span>
          </div>
        )}

        {employerApproval && (
          <div>
            <span>تایید کارفرما: </span>
            <span className="bg-[#def7ec] text-[#03543f] px-2 py-0.5 rounded text-[10px] inline-block font-medium">
              {employerApproval}
            </span>
          </div>
        )}

        {start_date && (
          <div>
            <span>تاریخ شروع: </span>
            <span className="text-black font-medium">{start_date}</span>
          </div>
        )}

        {last_update && (
          <div>
            <span>آخرین تغییرات: </span>
            <span className="text-black font-medium">{last_update}</span>
          </div>
        )}

        {statusText && (
          <div className="mt-1">
            <span className="text-gray-400">وضعیت پرداخت: </span>
            <span
              className={`px-3 py-0.5 rounded-[4px] text-[10px] font-bold inline-block ${getStatusStyle(statusText)}`}
            >
              {statusText}
            </span>
          </div>
        )}
      </div>

      {/* Only completed tasks link to their ticket thread */}
      {columnType === "completed" && (
        <a
          href="#ticket"
          onClick={handleGoToTicket}
          className="text-[#3b82f6] text-[11px] font-medium flex items-center gap-1 justify-end mt-2 hover:underline cursor-pointer"
        >
          هدایت به تیکت مربوطه
          <BiLinkExternal className="text-[12px]" />
        </a>
      )}
    </div>
  );
};

export default TaskCard;
