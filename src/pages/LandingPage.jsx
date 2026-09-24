import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="w-full min-h-screen bg-[#f8f9fa] flex flex-col justify-between items-center px-12 py-8 select-none overflow-x-hidden"
      dir="rtl"
      style={{ fontFamily: "Pinar-FD" }}
    >
      {/* -------------------- Header -------------------- */}
      <header className="w-full max-w-[1050px] flex justify-between items-center shrink-0">
        {/* Right side: nav links */}
        <nav className="flex items-center gap-8 text-[16px] font-bold text-[#1c1c1e]">
          <a
            href="#home"
            className="relative border-b-2 border-black pb-1 text-black font-extrabold"
          >
            خانه
          </a>
          <a
            href="#about"
            className="text-gray-600 hover:text-black transition-colors"
          >
            درباره ما
          </a>
          <a
            href="#projects"
            className="text-gray-600 hover:text-black transition-colors"
          >
            لیست پروژه ها
          </a>
        </nav>

        {/* Left side: register/login buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/register")}
            className="h-[42px] px-7 bg-white border border-black rounded-[5px] text-[15px] font-bold text-black shadow-[0_3px_0_0_#000000] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
          >
            ثبت نام
          </button>
          <button
            onClick={() => navigate("/login")}
            className="h-[42px] px-7 bg-white border border-black rounded-[5px] text-[15px] font-bold text-black shadow-[0_3px_0_0_#000000] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
          >
            ورود
          </button>
        </div>
      </header>

      {/* -------------------- Hero / Main Section -------------------- */}
      <main className="w-full max-w-[1050px] my-auto grid grid-cols-12 gap-10 items-center py-8">
        {/* Left column: employer request + final result illustration */}
        <div className="col-span-5 flex flex-col gap-4">
          {/* Card 1: employer request */}
          <div className="w-full bg-white border border-black rounded-[6px] p-4 shadow-[0_3px_0_0_#000000] text-right flex flex-col gap-1">
            <span className="text-[10px] text-gray-500 font-bold block">
              درخواست کارفرما
            </span>
            <p className="text-[11px] text-black leading-relaxed font-light">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
              استفاده از طراحان گرافیک است چاپگرها و متون بلکه روزنامه و مجله در
              ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز
            </p>
          </div>

          {/* Card 2: final result with the orange book illustration */}
          <div className="w-full bg-[#1c1c1e] text-white rounded-[10px] p-4 shadow-[0_4px_0_0_#000000] flex flex-col gap-3">
            <span className="text-[12px] font-bold text-right text-gray-200">
              نتیجه نهایی
            </span>

            {/* Inner orange banner */}
            <div className="w-full h-[210px] bg-[#d97706] rounded-[6px] flex items-center justify-center p-4 relative overflow-hidden shadow-inner">
              {/* Schematic poster/book-cover illustration */}
              <div className="w-[140px] h-[180px] bg-[#fffaf5] rounded-[4px] shadow-2xl p-3 flex flex-col items-center justify-between border border-amber-200">
                <div className="w-full flex justify-between items-center text-amber-900 text-[10px] font-bold">
                  <span>...</span>
                  <span className="w-2.5 h-2.5 bg-black rounded-sm"></span>
                </div>
                {/* Circle/logo mark on the book */}
                <div className="w-16 h-16 rounded-full border-2 border-amber-800 flex items-center justify-center relative">
                  <div className="w-10 h-10 border-t-2 border-r-2 border-amber-700 rounded-full rotate-45"></div>
                </div>
                <div className="text-center flex flex-col items-center gap-0.5">
                  <span className="text-[8px] font-black text-black tracking-wider">
                    ACKEE AND PLANTAIN
                  </span>
                  <span className="text-[6px] text-gray-500 scale-90">
                    Contemporary Vegan Caribbean Recipes
                  </span>
                </div>
              </div>
            </div>

            {/* Caption text below the illustration */}
            <p className="text-[10px] text-gray-300 text-right leading-relaxed font-light px-1">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با اس
              تفاده از طراحان گرافیک است چاپگرها و متون بلکه روزنامه و مجله در
              ستون و سطرآنچنان که لازم است
            </p>
          </div>
        </div>

        {/* Right column: headline + description + buttons + stats */}
        <div className="col-span-7 flex flex-col gap-6 text-right items-start pr-2">
          {/* Headline + description */}
          <div className="flex flex-col gap-4 text-right">
            <h1 className="text-[34px] font-bold text-black leading-[1.3]">
              لورم ایپسوم متن ساختگی <br /> با تولید سادگی نامفهوم
            </h1>
            <p className="text-[13px] text-gray-700 leading-[1.8] max-w-[460px] font-medium">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
              استفاده از طراحان گرافیک است چاپگرها و متون بلکه روزنامه و مجله در
              ستون و سطرآنچنان که لازم است
            </p>
          </div>

          {/* "Find work" (white) and "Post a project" (black) buttons */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => navigate("/login")}
              className="w-[150px] h-[46px] bg-white text-black border border-black rounded-[5px] text-[15px] font-bold shadow-[0_3px_0_0_#000000] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
            >
              انجام پروژه
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-[150px] h-[46px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[15px] font-bold shadow-[0_3px_0_0_#000000] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
            >
              ثبت پروژه
            </button>
          </div>

          {/* Bottom three-stat row */}
          <div className="w-full grid grid-cols-3 gap-4 pt-8 border-t border-gray-200 mt-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[26px] font-bold text-black">۱۰ هزار</span>
              <span className="text-[11px] text-gray-600 mt-1 font-medium">
                پروژه درحال انجام
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[26px] font-bold text-black">۲ هزار</span>
              <span className="text-[11px] text-gray-600 mt-1 font-medium">
                فریلنسر فعال
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[26px] font-bold text-black">۲۰ هزار</span>
              <span className="text-[11px] text-gray-600 mt-1 font-medium">
                پروژه قابل انجام
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
