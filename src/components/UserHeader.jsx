import React, { useEffect, useState, useRef } from "react";
import { BiBell, BiX } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getNotifications, markNotificationAsRead, logout as apiLogout, getMyProfile } from "../data/api";

const UserHeader = () => {
  const { user, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  
  // استیت‌های مربوط به پروفایل کاربر
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user) {
      getNotifications().then((res) => {
         if (res && res.length) setNotifications(res);
      });
    }
  }, [user]);

  // Click outside for notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifs]);

  // Escape key for profile modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowProfileModal(false);
      }
    };
    if (showProfileModal) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showProfileModal]);

  const handleRead = async (id) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
  };

  const handleLogout = () => {
    storeLogout();
    apiLogout();
    navigate("/login");
  };

  const handleShowProfile = async () => {
    setShowNotifs(false);
    setProfileLoading(true);
    try {
      const res = await getMyProfile();
      if (res.ok) {
        setProfileData(res.data);
        setShowProfileModal(true);
      } else {
        alert(res.message || "خطا در دریافت اطلاعات پروفایل");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 relative" dir="rtl" style={{ fontFamily: "Pinar-FD" }}>
      
      {/* زنگوله اعلانات */}
      <div className="relative" ref={notifRef}>
        <button
          type="button"
          onClick={() => setShowNotifs(!showNotifs)}
          className="w-9 h-9 rounded-full bg-white border border-black flex items-center justify-center text-lg shadow-[0_2px_0_0_#000000] cursor-pointer hover:bg-gray-50"
        >
          <BiBell />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {notifications.length}
            </span>
          )}
        </button>

        {/* دراپ‌داون نوتیفیکیشن‌ها */}
        {showNotifs && (
          <div className="absolute left-0 mt-2 w-72 bg-white border border-black rounded-[6px] shadow-[0_4px_0_0_#000000] p-3 z-50 flex flex-col gap-2">
            <h4 className="text-[12px] font-bold text-black border-b pb-1">اعلانات جدید</h4>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n._id || n.id}
                  onClick={() => handleRead(n._id || n.id)}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer text-right border"
                >
                  <span className="block text-[11px] font-bold text-black">{n.title}</span>
                  <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">{n.text}</p>
                </div>
              ))
            ) : (
              <span className="text-[11px] text-gray-400 text-center py-2">اعلان جدیدی ندارید</span>
            )}
          </div>
        )}
      </div>

      {/* آواتار کاربر و خروج */}
      <div className="flex items-center gap-2">
        <div
          onClick={profileLoading ? undefined : handleShowProfile}
          title="مشاهده پروفایل"
          className={`w-9 h-9 rounded-full bg-[#1c1c1e] text-white flex items-center justify-center font-bold text-[14px] cursor-pointer hover:bg-black transition-colors ${profileLoading ? 'opacity-60 cursor-wait' : ''}`}
        >
          {profileLoading ? "..." : (user?.initial || "U")}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
        >
          خروج
        </button>
      </div>

      {/* مودال پروفایل کاربر */}
      {showProfileModal && profileData && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowProfileModal(false)} />
          <div className="w-[360px] bg-white border border-black rounded-[8px] p-6 relative z-10 flex flex-col gap-4 text-right shadow-[0_6px_0_0_#000000]">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <h3 className="text-[18px] font-bold text-black">پروفایل من</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-black text-2xl cursor-pointer">
                <BiX />
              </button>
            </div>
            
            <div className="flex flex-col gap-3 text-[12px] mt-2">
              <div className="flex justify-between bg-gray-50 border border-gray-200 p-2 rounded">
                <span className="text-gray-500">نام و نام خانوادگی:</span>
                <span className="font-bold text-black">{profileData.firstName} {profileData.lastName}</span>
              </div>
              <div className="flex justify-between bg-gray-50 border border-gray-200 p-2 rounded">
                <span className="text-gray-500">نام کاربری:</span>
                <span className="font-bold text-black font-mono">{profileData.username}</span>
              </div>
              <div className="flex justify-between bg-gray-50 border border-gray-200 p-2 rounded">
                <span className="text-gray-500">کد یکتا (آیدی):</span>
                <span className="font-bold text-blue-600 font-mono">{profileData.uniqueId || "—"}</span>
              </div>
              <div className="flex justify-between bg-gray-50 border border-gray-200 p-2 rounded">
                <span className="text-gray-500">ایمیل:</span>
                <span className="font-bold text-black font-mono">{profileData.email}</span>
              </div>
              <div className="flex justify-between bg-gray-50 border border-gray-200 p-2 rounded">
                <span className="text-gray-500">شماره همراه:</span>
                <span className="font-bold text-black font-mono">{profileData.phone}</span>
              </div>
              <div className="flex justify-between bg-gray-50 border border-gray-200 p-2 rounded">
                <span className="text-gray-500">نقش سیستم:</span>
                <span className="font-bold text-black px-2 py-0.5 bg-gray-200 rounded">{profileData.role}</span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full h-[40px] bg-red-600 text-white rounded-[5px] text-[13px] font-bold mt-2 cursor-pointer hover:bg-red-700 transition-colors"
            >
              خروج از حساب
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserHeader;