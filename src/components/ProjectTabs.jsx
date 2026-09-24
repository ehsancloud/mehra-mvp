import React, { useState } from "react";
import { motion } from "framer-motion";

const ProjectTabs = ({ onChange, className = "" }) => {
  const tabs = [
    { id: "active", label: "فعال" },
    { id: "completed", label: "انجام شده" },
    { id: "open", label: "پروژه‌های باز" },
  ];

  const [activeTab, setActiveTab] = useState("active");

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <div
      dir="rtl"
      className={`relative h-[54px] bg-[#eef0f2] border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-1 flex items-center ${className || "w-[657px]"}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className="relative flex-1 h-full flex items-center justify-center text-center outline-none z-10 cursor-pointer"
            style={{
              fontFamily: "Pinar-FD",
              fontWeight: "400",
              fontSize: "20px",
              color: isActive ? "#000000" : "#4a4a4a",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-white rounded-[4px] shadow-sm"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}

            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default ProjectTabs;
