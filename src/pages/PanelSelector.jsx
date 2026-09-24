import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BiUserCheck,
  BiBriefcaseAlt2,
  BiUserVoice,
  BiShieldQuarter,
} from "react-icons/bi";

const PanelSelector = () => {
  const navigate = useNavigate();

  const panels = [
    {
      id: "admin",
      title: "پنل مدیریت ادمین",
      description: "دسترسی کامل به گزارشات، مدیریت کاربران، پروژه‌ها و تیکت‌ها",
      path: "/admin/reports",
      icon: <BiShieldQuarter className="text-4xl text-red-600" />,
      badge: "ADMIN",
      badgeBg: "bg-red-100 text-red-700 border-red-300",
    },
    {
      id: "supervisor",
      title: "پنل ناظر",
      description: "مدیریت و نظارت بر پروژه‌ها، تیکت‌ها، کاربران و بخش مالی",
      path: "/supervisor-projects",
      icon: <BiUserVoice className="text-4xl text-blue-600" />,
      badge: "SUPERVISOR",
      badgeBg: "bg-blue-100 text-blue-700 border-blue-300",
    },
    {
      id: "employer",
      title: "پنل کارفرما",
      description: "ثبت پروژه‌های جدید، بررسی پیشنهادات و مدیریت تیکت‌ها",
      path: "/employer-projects",
      icon: <BiBriefcaseAlt2 className="text-4xl text-emerald-600" />,
      badge: "EMPLOYER",
      badgeBg: "bg-emerald-100 text-emerald-700 border-emerald-300",
    },
    {
      id: "freelancer",
      title: "پنل فریلنسر",
      description:
        "مشاهده پروژه‌های باز، ارسال پیشنهاد و پیگیری پروژه‌های فعال",
      path: "/projects",
      icon: <BiUserCheck className="text-4xl text-amber-600" />,
      badge: "FREELANCER",
      badgeBg: "bg-amber-100 text-amber-700 border-amber-300",
    },
  ];

  return (
    <div
      className="w-full h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none"
      dir="rtl"
      style={{ fontFamily: "Pinar-FD" }}
    >
      {/* Panel selection page header */}
      <div className="text-center mb-10 flex flex-col items-center gap-2">
        <h1 className="text-[32px] font-bold text-black">
          انتخاب نقش و ورود به سیستم
        </h1>
        <p className="text-gray-500 text-[14px]">
          لطفاً پنل مورد نظر خود را برای ورود انتخاب کنید
        </p>
      </div>

      {/* Panel selection cards */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-[800px]">
        {panels.map((panel) => (
          <div
            key={panel.id}
            onClick={() => navigate(panel.path)}
            className="bg-white border border-black rounded-[8px] p-6 shadow-[0_4px_0_0_#000000] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex flex-col justify-between h-[170px] relative group"
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-gray-50 rounded-[6px] border border-gray-200 group-hover:border-black transition-colors">
                {panel.icon}
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded border font-mono ${panel.badgeBg}`}
              >
                {panel.badge}
              </span>
            </div>

            <div className="flex flex-col gap-1 text-right mt-2">
              <h2 className="text-[18px] font-bold text-black">
                {panel.title}
              </h2>
              <p className="text-[12px] text-gray-500 leading-snug">
                {panel.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelSelector;
