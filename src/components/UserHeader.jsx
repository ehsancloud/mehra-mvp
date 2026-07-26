import React from "react";

// onNotificationsClick is optional so existing call sites keep working
// unchanged. Wire it up to a real notifications panel/endpoint later.
const UserHeader = ({
  userInitial = "M",
  hasNotification = true,
  onNotificationsClick,
}) => {
  const handleBellClick = () => {
    if (onNotificationsClick) {
      onNotificationsClick();
    } else {
      // TODO(API): replace with GET /notifications + a dropdown/panel UI
      console.log("Notifications clicked - no handler wired yet");
    }
  };

  return (
    <div className="flex items-center gap-3" dir="rtl">
      {/* Notification bell with layered 3D shadow style */}
      <button
        type="button"
        onClick={handleBellClick}
        className="
          w-[46px] h-[46px] bg-white border border-black rounded-full 
          shadow-[0_3px_0_0_#000000] flex items-center justify-center 
          relative cursor-pointer transition-all duration-150
          hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#000000]
          active:translate-y-[3px] active:shadow-none
        "
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
            fill="#1c1c1e"
          />
        </svg>

        {/* Unread notification indicator */}
        {hasNotification && (
          <span className="absolute top-[10px] right-[13px] w-[7px] h-[7px] bg-[#ef4444] rounded-full ring-1 ring-white" />
        )}
      </button>
      <div
        className="w-[46px] h-[46px] bg-[#3b82f6] text-white rounded-full flex items-center justify-center font-bold text-lg select-none"
        style={{ fontFamily: "Pinar-FD" }}
      >
        {userInitial}
      </div>
    </div>
  );
};

export default UserHeader;
