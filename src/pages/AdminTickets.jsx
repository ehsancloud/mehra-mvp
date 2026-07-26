import React, { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import TicketRowCard from "../components/TicketRowCard";
import { getTickets, getCurrentUserId, getUserById } from "../data/api";

const AdminTickets = () => {
  const [activeTab, setActiveTab] = useState("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState([]);

  const adminId = getCurrentUserId("admin");
  const currentAdmin = getUserById(adminId);

  useEffect(() => {
    // Admin sees every ticket platform-wide, not just their own.
    getTickets({ stage: activeTab, query: searchQuery }).then(setTickets);
  }, [activeTab, searchQuery]);

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
          مدیریت تیکت‌ها
        </h1>
        <UserHeader userInitial={currentAdmin?.initial} hasNotification={true} />
      </header>

      <div className="flex-1 w-full flex flex-col items-center overflow-hidden">
        <div
          className="relative h-[54px] bg-[#eef0f2] border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-1 flex items-center w-[657px] mb-4 shrink-0 select-none"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <button
            onClick={() => {
              setActiveTab("current");
              setSearchQuery("");
            }}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[20px] cursor-pointer z-10 ${
              activeTab === "current"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#4a4a4a]"
            }`}
          >
            تیکت جاری
          </button>
          <button
            onClick={() => {
              setActiveTab("archived");
              setSearchQuery("");
            }}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[20px] cursor-pointer z-10 ${
              activeTab === "archived"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#4a4a4a]"
            }`}
          >
            بایگانی
          </button>
        </div>

        <div
          className="w-[657px] flex gap-2 mb-6 shrink-0 select-none"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <input
            type="text"
            placeholder="مشخصات تیکت مورد نظر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-[38px] bg-white border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none placeholder-gray-400 text-right"
          />
          <button
            type="button"
            className="w-[100px] h-[38px] bg-white text-black border border-black rounded-[5px] shadow-[0_2px_0_0_#000000] active:translate-y-[1px] text-[13px] font-bold cursor-pointer transition-all"
          >
            جستجو
          </button>
        </div>

        <div className="w-[657px] flex-1 overflow-y-auto pr-1 pl-1 flex flex-col items-center gap-6 scrollbar-none pb-12">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <TicketRowCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <p
              className="text-gray-500 mt-10 text-[14px]"
              style={{ fontFamily: "Pinar-FD" }}
            >
              تیکتی با این مشخصات یافت نشد.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTickets;
