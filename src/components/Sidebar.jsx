import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  // Detect the current role from the URL
  const isAdmin = location.pathname.startsWith("/admin");
  const isSupervisor = location.pathname.startsWith("/supervisor");
  const isEmployer = location.pathname.startsWith("/employer");

  // Admin-only menu items (4 sections)
  const adminMenuItems = [
    {
      id: "reports",
      path: "/admin/reports",
      title: "گزارشات",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="current-fill"
        >
          <path
            d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      id: "users",
      path: "/admin/users",
      title: "کاربران",
      icon: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          className="current-fill"
        >
          <path
            d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      id: "projects",
      path: "/admin/projects",
      title: "پروژه‌ها",
      icon: (
        <svg
          width="45"
          height="20"
          viewBox="0 0 34 14"
          fill="none"
          className="current-fill"
        >
          <circle cx="6" cy="7" r="4.5" stroke="currentColor" strokeWidth="3" />
          <path
            d="M14 3L20 11M20 3L14 11"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="25"
            y="2.5"
            width="8"
            height="9"
            rx="1"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      ),
    },
    {
      id: "tickets",
      path: "/admin/tickets",
      title: "تیکت‌ها",
      icon: (
        <svg
          width="34"
          height="31"
          viewBox="0 0 24 22"
          fill="none"
          className="current-fill"
        >
          <path d="M2 2H22V16H8L3 21V16H2V2Z" fill="currentColor" />
          <circle cx="9" cy="9" r="1.5" fill="#1c1c1e" />
          <circle cx="15" cy="9" r="1.5" fill="#1c1c1e" />
        </svg>
      ),
    },
  ];

  // Supervisor-only menu items (5 sections)
  const supervisorMenuItems = [
    {
      id: "finance",
      path: "/supervisor-finance",
      title: "مدیریت مالی",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="current-fill"
        >
          <path
            d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.89 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      id: "projects",
      path: "/supervisor-projects",
      title: "پروژه‌ها",
      icon: (
        <svg
          width="45"
          height="20"
          viewBox="0 0 34 14"
          fill="none"
          className="current-fill"
        >
          <circle cx="6" cy="7" r="4.5" stroke="currentColor" strokeWidth="3" />
          <path
            d="M14 3L20 11M20 3L14 11"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="25"
            y="2.5"
            width="8"
            height="9"
            rx="1"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      ),
    },
    {
      id: "dashboard",
      path: "/supervisor-dashboard",
      title: "داشبورد",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="current-fill"
        >
          <rect
            x="2"
            y="2"
            width="9"
            height="20"
            rx="2.5"
            fill="currentColor"
          />
          <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" />
          <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "tickets",
      path: "/supervisor-tickets",
      title: "تیکت‌ها",
      icon: (
        <svg
          width="34"
          height="31"
          viewBox="0 0 24 22"
          fill="none"
          className="current-fill"
        >
          <path d="M2 2H22V16H8L3 21V16H2V2Z" fill="currentColor" />
          <circle cx="9" cy="9" r="1.5" fill="#1c1c1e" />
          <circle cx="15" cy="9" r="1.5" fill="#1c1c1e" />
        </svg>
      ),
    },
    {
      id: "users",
      path: "/supervisor-users",
      title: "کاربران",
      icon: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          className="current-fill"
        >
          <path
            d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ];

  // Shared 3-item menu for freelancer and employer
  const defaultMenuItems = [
    {
      id: "projects",
      path: isEmployer ? "/employer-projects" : "/projects",
      title: "پروژه‌ها",
      icon: (
        <svg
          width="45"
          height="20"
          viewBox="0 0 34 14"
          fill="none"
          className="current-fill"
        >
          <circle cx="6" cy="7" r="4.5" stroke="currentColor" strokeWidth="3" />
          <path
            d="M14 3L20 11M20 3L14 11"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="25"
            y="2.5"
            width="8"
            height="9"
            rx="1"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      ),
    },
    {
      id: "dashboard",
      path: isEmployer ? "/employer-dashboard" : "/dashboard",
      title: "داشبورد",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="current-fill"
        >
          <rect
            x="2"
            y="2"
            width="9"
            height="20"
            rx="2.5"
            fill="currentColor"
          />
          <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" />
          <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "tickets",
      path: isEmployer ? "/employer-tickets" : "/tickets",
      title: "تیکت‌ها",
      icon: (
        <svg
          width="34"
          height="31"
          viewBox="0 0 24 22"
          fill="none"
          className="current-fill"
        >
          <path d="M2 2H22V16H8L3 21V16H2V2Z" fill="currentColor" />
          <circle cx="9" cy="9" r="1.5" fill="#1c1c1e" />
          <circle cx="15" cy="9" r="1.5" fill="#1c1c1e" />
        </svg>
      ),
    },
  ];

  const menuItems = isAdmin
    ? adminMenuItems
    : isSupervisor
      ? supervisorMenuItems
      : defaultMenuItems;

  return (
    <div
      className="w-[80px] h-screen bg-[#1c1c1e] flex flex-col items-center justify-center relative shrink-0"
      dir="rtl"
    >
      <div className="flex flex-col gap-9 items-center w-full">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            title={item.title}
            className={({ isActive }) => `
              relative w-full h-[25px] flex items-center justify-center transition-all duration-150 cursor-pointer
              ${isActive ? "text-white" : "text-[#828282] hover:text-zinc-300"}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center justify-center w-full h-full">
                  {item.icon}
                </div>

                {isActive && (
                  <div
                    className="absolute right-0 top-[10%] w-[4px] h-[80%] bg-white rounded-l-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    style={{ borderRadius: "4px 0 0 4px" }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
