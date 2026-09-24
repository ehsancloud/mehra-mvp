import React from "react";
import { useTicket } from "../context/TicketContext";
import { getTicketStatusColor } from "../utils/tickets";

const TicketRowCard = ({ ticket }) => {
  const { openChat } = useTicket();
  const { id, title, lastUpdate, department, party, status, priority } = ticket;

  return (
    <div
      onClick={() => openChat(id, title)}
      dir="rtl"
      className="w-[657px] min-h-[94px] bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-4 flex justify-between items-center cursor-pointer select-none transition-all hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#000000] active:translate-y-[3px] active:shadow-none shrink-0"
      style={{ fontFamily: "Pinar-FD" }}
    >
      {/* Right: layered avatars + ticket subject */}
      <div className="flex items-center gap-3 justify-start w-[210px] shrink-0 text-right">
        <div className="flex relative w-[44px] h-[32px] items-center shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[11px] border border-white z-10">
            M
          </div>
          <div className="w-7 h-7 rounded-full bg-[#1c1c1e] text-white flex items-center justify-center font-bold text-[11px] border border-white absolute right-4">
            A
          </div>
        </div>

        <div className="text-right text-[12px] flex flex-col gap-0.5">
          <span className="text-gray-400 text-[10px]">موضوع</span>
          <span className="font-bold text-black text-[14px] whitespace-nowrap">
            {title}
          </span>
          <span className="text-gray-400 text-[10px] mt-0.5">آخرین آپدیت</span>
          <span className="font-medium text-gray-700">{lastUpdate}</span>
        </div>
      </div>

      {/* Middle: department + counterparty */}
      <div className="flex-1 flex flex-col gap-2 text-[12px] text-right px-4">
        <div>
          <span className="text-gray-400">دپارتمان</span>
          <span className="block font-bold text-black mt-0.5">
            {department}
          </span>
        </div>
        <div>
          <span className="text-gray-400">طرف تیکت</span>
          <span className="block font-medium text-gray-700 mt-0.5">
            {party}
          </span>
        </div>
      </div>

      {/* Ticket id */}
      <div className="w-[100px] shrink-0 text-center text-[12px]">
        <span className="text-gray-400 block mb-1">ایدی</span>
        <span className="font-bold text-gray-800">{id}</span>
      </div>

      <div className="h-12 border-r border-gray-200 mx-2 self-center"></div>

      {/* Priority + status */}
      <div className="w-[110px] shrink-0 text-left text-[12px] flex flex-col gap-1.5 justify-center">
        <div>
          <span className="text-gray-400">الویّت</span>
          <span className="block font-bold text-black mt-0.5">{priority}</span>
        </div>
        <div>
          <span className="text-gray-400">وضعیت</span>
          <span
            className={`block font-bold mt-0.5 whitespace-nowrap ${getTicketStatusColor(status)}`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TicketRowCard;
