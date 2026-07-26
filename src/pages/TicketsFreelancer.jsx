import React, { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import TicketRowCard from "../components/TicketRowCard";
import { sortTicketsByActivity } from "../utils/tickets";
import { getTickets, getCurrentUserId, getUserById } from "../data/api";

const TicketsFreelancer = () => {
  // "current" or "archived"
  const [activeTab, setActiveTab] = useState("current");
  const [tickets, setTickets] = useState([]);

  const freelancerId = getCurrentUserId("freelancer");
  const currentFreelancer = getUserById(freelancerId);

  useEffect(() => {
    getTickets({ freelancerId, stage: activeTab }).then(setTickets);
  }, [freelancerId, activeTab]);

  // Replied tickets bubble to the top, like an unread-reply inbox.
  const sortedTickets = sortTicketsByActivity(tickets);

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
          تیکت ها
        </h1>
        <UserHeader userInitial={currentFreelancer?.initial} hasNotification={true} />
      </header>

      <div className="flex-1 w-full flex flex-col items-center overflow-hidden">
        <div
          className="relative h-[54px] bg-[#eef0f2] border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-1 flex items-center w-[657px] mb-6 shrink-0 select-none"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <button
            onClick={() => setActiveTab("current")}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[20px] cursor-pointer z-10 ${activeTab === "current" ? "bg-white text-black font-bold shadow-sm" : "text-[#4a4a4a]"}`}
          >
            تیکت جاری
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[20px] cursor-pointer z-10 ${activeTab === "archived" ? "bg-white text-black font-bold shadow-sm" : "text-[#4a4a4a]"}`}
          >
            بایگانی
          </button>
        </div>

        <div className="w-[657px] flex-1 overflow-y-auto pr-1 pl-1 flex flex-col items-center gap-6 scrollbar-none pb-12">
          {sortedTickets.length > 0 ? (
            sortedTickets.map((ticket) => (
              <TicketRowCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <p
              className="text-gray-500 mt-10"
              style={{ fontFamily: "Pinar-FD" }}
            >
              تیکتی در این بخش وجود ندارد.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsFreelancer;
