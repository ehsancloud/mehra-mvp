import React from "react";

const Input = ({ label, className = "", type = "text", ...props }) => {
  return (
    <div dir="rtl" className={`relative ${className || "w-[400px]"}`}>
      <fieldset
        className="
          relative h-[66px] border border-black rounded-[5px] bg-white
          shadow-[0_4px_0_0_#000000] px-4 flex items-center
        "
      >
        {label && (
          <legend
            className="pr-2 pl-2 text-right text-black"
            style={{
              fontFamily: "Pinar-FD",
              fontWeight: "400",
              fontSize: "16px",
            }}
          >
            {label}
          </legend>
        )}

        <input
          type={type}
          className="w-full h-full bg-transparent border-none outline-none text-black px-1"
          style={{
            fontFamily: "Pinar-FD",
            fontWeight: "400",
            fontSize: "18px",
          }}
          {...props}
        />
      </fieldset>
    </div>
  );
};

export default Input;
