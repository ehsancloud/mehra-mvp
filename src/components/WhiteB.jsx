import React from "react";

const WhiteB = ({ children, className = "", ...props }) => {
  return (
    <button
      dir="rtl"
      className={`
        inline-flex items-center justify-center
        h-[48px] bg-white text-black
        border border-black rounded
        shadow-[0_4px_0_0_#000000]
        cursor-pointer
        text-center align-middle
        transition-all duration-150
        hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#000000]
        active:translate-y-[4px] active:shadow-none
        ${className || "w-[190px]"}
      `}
      style={{
        fontFamily: "Pinar-FD",
        fontWeight: "400",
        fontSize: "24px",
        lineHeight: "100%",
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default WhiteB;
