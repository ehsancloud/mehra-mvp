import React, { useEffect, useState } from "react";
import { useTicket } from "../context/TicketContext";
import { sortTicketsByActivity } from "../utils/tickets";
import { getTickets, getCurrentUserId } from "../data/api";

const getStatusColor = (status) => {
  const map = {
    "پاسخ داده شده": "text-gray-700",
    "در انتظار بررسی": "text-gray-500",
  };
  return map[status] || "text-gray-500";
};

const getPriorityColor = (priority) => {
  const map = {
    "بسیار بالا": "text-[#b90000]",
    زیاد: "text-[#b90000]",
    متوسط: "text-[#22c55e]",
    کم: "text-[#22c55e]",
  };
  return map[priority] || "text-gray-700";
};

// Shown on the Freelancer, Employer, and Supervisor dashboards - `role`
// picks whose open tickets to load.
const OpenTicketsWidget = ({ role = "freelancer" }) => {
  const { openChat } = useTicket();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const userId = getCurrentUserId(role);
    const filter = { stage: "current", [`${role}Id`]: userId };
    getTickets(filter).then(setTickets);
  }, [role]);

  // Replied tickets bubble to the top, like an unread-reply inbox.
  const sortedTickets = sortTicketsByActivity(tickets);

  return (
    <div dir="rtl" className="w-full" style={{ fontFamily: "Pinar-FD" }}>
      <h3 className="text-[22px] font-bold text-black mb-3 text-right">
        تیکت های باز
      </h3>

      <div className="w-full bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-4 flex flex-col gap-4 min-h-[220px]">
        {sortedTickets.map((ticket, index) => (
          <div key={ticket.id} className="w-full">
            <div
              onClick={() => openChat(ticket.id, ticket.title)}
              className="flex justify-between items-center w-full cursor-pointer rounded-[4px] transition-colors hover:bg-gray-50 -mx-2 px-2 py-1"
            >
              <div className="flex items-center gap-3 justify-start w-[220px] shrink-0 text-right">
                <div className="flex relative w-[44px] h-[32px] items-center shrink-0">
                  <div className="w-7 h-7 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[11px] border border-white z-10 select-none">
                    M
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#1c1c1e] text-white flex items-center justify-center font-bold text-[11px] border border-white absolute right-4 select-none">
                    A
                  </div>
                </div>

                <div className="text-right text-[12px]">
                  <span className="block font-bold text-black whitespace-nowrap">
                    {ticket.freelancerName || "—"} | فریلنسر
                  </span>
                  <span className="block text-gray-500 mt-0.5 whitespace-nowrap">
                    {ticket.supervisorName || "—"} | ناظر
                  </span>
                </div>
              </div>

              <div className="flex-1 text-center font-bold text-[16px] text-black px-2">
                {ticket.title}
              </div>

              <div className="flex flex-col gap-1 text-[12px] w-[140px] shrink-0 text-left">
                <div className="whitespace-nowrap">
                  <span className="text-gray-400">وضعیت : </span>
                  <span
                    className={`font-medium ${getStatusColor(ticket.status)}`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div className="whitespace-nowrap">
                  <span className="text-gray-400">مقدار اهمیت : </span>
                  <span
                    className={`font-bold ${getPriorityColor(ticket.priority)}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
            </div>

            {index < sortedTickets.length - 1 && (
              <div className="w-full border-b border-gray-100 mt-4"></div>
            )}
          </div>
        ))}

        {sortedTickets.length === 0 && (
          <p className="text-center text-gray-400 text-[12px] py-6">
            تیکت باز فعالی وجود ندارد.
          </p>
        )}
      </div>
    </div>
  );
};

export default OpenTicketsWidget;
