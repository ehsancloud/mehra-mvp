import React from "react";
import UserHeader from "../components/UserHeader";
import OpenTicketsWidget from "../components/OpenTicketsWidget";
import WeeklyReportsWidget from "../components/WeeklyReportsWidget";
import EmployerWalletWidget from "../components/EmployerWalletWidget";
import EmployerReportsKanban from "../components/EmployerReportsKanban";
import { getCurrentUserId, getUserById } from "../data/api";

const DashboardEmployer = () => {
  const currentEmployer = getUserById(getCurrentUserId("employer"));

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden" dir="rtl">
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <header className="w-full flex justify-between items-center px-12 py-6 shrink-0 select-none">
          <h1
            className="text-[32px] font-bold text-[#1c1c1e]"
            style={{ fontFamily: "Pinar-FD" }}
          >
            داشبورد
          </h1>
          <UserHeader userInitial={currentEmployer?.initial} hasNotification={true} />
        </header>

        <div className="flex-1 w-full overflow-y-auto px-12 pb-12 flex gap-8 scrollbar-none items-start">
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="w-full flex gap-6 items-start">
              <div className="flex-1">
                <OpenTicketsWidget role="employer" />
              </div>
              <div className="shrink-0">
                <EmployerWalletWidget />
              </div>
            </div>

            <div className="w-full">
              <EmployerReportsKanban />
            </div>
          </div>

          <div className="shrink-0">
            <WeeklyReportsWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmployer;
