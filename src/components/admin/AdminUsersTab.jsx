import React, { useEffect, useMemo, useState } from "react";
import UserProfileModal from "../UserProfileModal";
import { getUserDirectory } from "../../data/api";

const AdminUsersTab = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [roleFilters, setRoleFilters] = useState({
    normal: true,
    freelancer: true,
    employer: true,
    supervisor: true,
    admin: true,
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getUserDirectory().then((data) => setUsers(data || []));
  }, []);

  const toggleRoleFilter = (roleKey) => {
    setRoleFilters((prev) => ({ ...prev, [roleKey]: !prev[roleKey] }));
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q)
    );
  });
  return (
    <div
      className="w-[750px] flex flex-col gap-4 items-center"
      style={{ fontFamily: "Pinar-FD" }}
    >
      <div className="w-full flex gap-2 shrink-0 select-none">
        <button
          type="button"
          className="w-[100px] h-[38px] bg-white text-black border border-black rounded-[5px] shadow-[0_2px_0_0_#000000] text-[13px] font-bold cursor-pointer"
        >
          جستجو
        </button>
        <input
          type="text"
          placeholder="جستجوی کاربر..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-[40px] border border-black rounded-[5px] px-3 text-[12px] bg-white text-right"
        />
      </div>

      <div className="w-full bg-white border border-black rounded-[5px] p-2 px-4 flex justify-between items-center text-[11px] font-bold select-none shadow-sm">
        {Object.keys(roleFilters).map((role) => (
          <label key={role} className="flex items-center gap-2 cursor-pointer">
            <span>
              {role === "normal"
                ? "کاربران عادی"
                : role === "freelancer"
                  ? "فریلنسر ها"
                  : role === "employer"
                    ? "کارفرما ها"
                    : role === "supervisor"
                      ? "ناظران"
                      : "ادمین"}
            </span>
            <input
              type="checkbox"
              checked={roleFilters[role]}
              onChange={() => toggleRoleFilter(role)}
              className="w-8 h-4 bg-gray-300 checked:bg-green-500 rounded-full appearance-none relative cursor-pointer transition-all before:content-[''] before:w-3 before:h-3 before:bg-white before:rounded-full before:absolute before:top-0.5 before:right-0.5 checked:before:translate-x-[-16px] before:transition-all"
            />
          </label>
        ))}
      </div>

      <div className="w-full flex flex-col gap-3 max-h-[calc(100vh-340px)] overflow-y-auto scrollbar-none pb-12">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id || user._id}
              className="w-full h-[62px] bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] px-4 flex justify-between items-center select-none shrink-0"
            >
              <div className="flex items-center gap-4 text-[11px]">
                <div className="w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                 {user.initial || user.username?.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col text-right min-w-[50px]">
                  <span className="text-[9px] text-gray-400">نام</span>
                  <span className="font-bold text-black">{user.firstName}</span>
                </div>

                <div className="flex flex-col text-right min-w-[80px]">
                  <span className="text-[9px] text-gray-400">نام خانوادگی</span>
                  <span className="font-bold text-black">{user.lastName}</span>
                </div>

                <div className="h-6 border-r border-gray-300"></div>

                <div className="flex flex-col text-center min-w-[90px]">
                  <span className="text-[9px] text-gray-400">نام کاربری</span>
                  <span className="font-bold text-black font-mono">
                    {user.username}
                  </span>
                </div>

                <div className="h-6 border-r border-gray-300"></div>

                <div className="flex flex-col text-center min-w-[70px]">
                  <span className="text-[9px] text-gray-400">نقش کاربر</span>
                  <span className="font-bold text-blue-600">
                    {user.roleText || user.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedUser(user);
                  setIsModalOpen(true);
                }}
                className="h-[32px] px-4 bg-[#1c1c1e] text-white border border-black rounded-[4px] text-[11px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
              >
                مشاهده جزئیات
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 text-[13px] py-8">
            کاربری با این مشخصات یافت نشد.
          </div>
        )}
      </div>

      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminUsersTab;
