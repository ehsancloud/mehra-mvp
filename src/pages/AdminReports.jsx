import React, { useState } from "react";
import UserHeader from "../components/UserHeader";
import AdminUsersTab from "../components/admin/AdminUsersTab";
import AdminDepartmentTab from "../components/admin/AdminDepartmentTab";
import AdminReportsTab from "../components/admin/AdminReportsTab";
import { getCurrentUserId, getUserById } from "../data/api";

const AdminReports = () => {
  // Default tab: users
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'department' | 'reports'
  const currentAdmin = getUserById(getCurrentUserId("admin"));

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
          گزارشات
        </h1>
        <UserHeader userInitial={currentAdmin?.initial} hasNotification={true} />
      </header>

      <div className="flex-1 w-full flex flex-col items-center overflow-y-auto pb-12 scrollbar-none">
        <div
          className="relative h-[54px] bg-[#eef0f2] border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-1 flex items-center w-[750px] mb-4 shrink-0 select-none"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 h-full rounded-[4px] text-[18px] transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#4a4a4a]"
            }`}
          >
            کاربران
          </button>
          <button
            onClick={() => setActiveTab("department")}
            className={`flex-1 h-full rounded-[4px] text-[18px] transition-all cursor-pointer ${
              activeTab === "department"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#4a4a4a]"
            }`}
          >
            دپارتمان
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex-1 h-full rounded-[4px] text-[18px] transition-all cursor-pointer ${
              activeTab === "reports"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#4a4a4a]"
            }`}
          >
            گزارشات
          </button>
        </div>

        {activeTab === "users" && <AdminUsersTab />}
        {activeTab === "department" && <AdminDepartmentTab />}
        {activeTab === "reports" && <AdminReportsTab />}
      </div>
    </div>
  );
};

export default AdminReports;
