import React from "react";
import UserHeader from "../components/UserHeader";
import OpenTicketsWidget from "../components/OpenTicketsWidget";
import RevenueChart from "../components/RevenueChart";
import TaskManager from "../components/TaskManager";
import { getCurrentUserId, getUserById } from "../data/api";

const Dashboard = () => {
  const currentFreelancer = getUserById(getCurrentUserId("freelancer"));

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
          داشبورد
        </h1>
        <UserHeader userInitial={currentFreelancer?.initial} hasNotification={true} />
      </header>

      <div className="flex-1 w-full overflow-y-auto px-12 pb-12 flex flex-col gap-8 scrollbar-none">
        {/* Row 1: revenue chart + open tickets */}
        <div className="w-full flex gap-6 items-start">
          <div className="flex-1">
            <RevenueChart />
          </div>
          <div className="flex-1 max-w-[45%]">
            <OpenTicketsWidget role="freelancer" />
          </div>
        </div>

        {/* Row 2: kanban task manager */}
        <div className="w-full">
          <TaskManager />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
