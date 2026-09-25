import React, { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import UserProfileModal from "../components/UserProfileModal";
import { getUsers } from "../data/api";
import { useAuthStore } from "../store/authStore";
const TAB_TO_ROLE = { freelancers: "freelancer", employers: "employer" };

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState("freelancers"); // 'freelancers' | 'employers'
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user: currentAdmin } = useAuthStore();

  useEffect(() => {
    getUsers({ role: TAB_TO_ROLE[activeTab], query: searchQuery }).then(setUsers);
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
          مدیریت کاربران
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
              setActiveTab("freelancers");
              setSearchQuery("");
            }}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[18px] cursor-pointer z-10 ${
              activeTab === "freelancers"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#4a4a4a]"
            }`}
          >
            فریلنسر ها
          </button>
          <button
            onClick={() => {
              setActiveTab("employers");
              setSearchQuery("");
            }}
            className={`flex-1 h-full flex items-center justify-center text-center outline-none transition-all rounded-[4px] text-[18px] cursor-pointer z-10 ${
              activeTab === "employers"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#4a4a4a]"
            }`}
          >
            کارفرما ها
          </button>
        </div>

        <div
          className="w-[657px] flex gap-2 mb-6 shrink-0 select-none"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <input
            type="text"
            placeholder={
              activeTab === "freelancers"
                ? "مشخصات فریلنسر مورد نظر..."
                : "مشخصات کارفرما مورد نظر..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-[38px] bg-white border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none placeholder-gray-400 text-right"
          />
          <button
            type="button"
            className="w-[100px] h-[38px] bg-white text-black border border-black rounded-[5px] shadow-[0_2px_0_0_#000000] text-[13px] font-bold cursor-pointer"
          >
            جستجو
          </button>
        </div>

        <div className="w-[657px] flex-1 overflow-y-auto pr-1 pl-1 flex flex-col items-center gap-4 scrollbar-none pb-12">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className="w-[657px] h-[72px] bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] px-5 flex justify-between items-center select-none shrink-0 transition-all hover:translate-y-[1px]"
                style={{ fontFamily: "Pinar-FD" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[14px] shrink-0 border border-white shadow-sm">
                    {user.initial}
                  </div>

                  <div className="flex items-center gap-4 text-[12px]">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-gray-400">نام</span>
                      <span className="font-bold text-black">
                        {user.firstName}
                      </span>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-gray-400">
                        نام خانوادگی
                      </span>
                      <span className="font-bold text-black">
                        {user.lastName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-8 border-r border-gray-300 mx-2"></div>

                <div className="flex flex-col text-center">
                  <span className="text-[10px] text-gray-400">نام کاربری</span>
                  <span className="font-bold text-black font-mono text-[13px]">
                    {user.username}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsModalOpen(true);
                  }}
                  className="h-[34px] px-4 bg-[#1c1c1e] text-white border border-black rounded-[4px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
                >
                  مشاهده جزئیات
                </button>
              </div>
            ))
          ) : (
            <p
              className="text-gray-500 mt-10 text-[14px]"
              style={{ fontFamily: "Pinar-FD" }}
            >
              کاربری با این مشخصات یافت نشد.
            </p>
          )}
        </div>
      </div>

      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminUsers;
