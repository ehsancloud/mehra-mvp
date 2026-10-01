
import React, { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import {
  BiUserCheck,
  BiBriefcaseAlt2,
  BiShieldQuarter,
} from "react-icons/bi";

import { completeRegistration } from "../data/api";

import { useAuthStore } from "../store/authStore";

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const storeLogin = useAuthStore((state) => state.login);

  const { user: currentUser } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState("freelancer");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSupervisorRole =
    currentUser?.roles?.includes("supervisor");

  const handleFinalRegister = async () => {

    setIsSubmitting(true);

    const result = await completeRegistration({
      role: selectedRole,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      alert("ثبت‌نام با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
      return;
    }

    const roleName =
      selectedRole === "freelancer"
        ? "فریلنسر"
        : selectedRole === "employer"
        ? "کارفرما"
        : "ناظر";

    alert(
      `ثبت‌نام شما با موفقیت در نقش ${roleName} انجام شد!`
    );

    storeLogin(result.user);

    navigate(result.redirectPath);
  };

  return (
    <div
      className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-6 select-none"
      dir="rtl"
      style={{ fontFamily: "Pinar-FD" }}
    >
      <div className="w-[600px] flex flex-col items-center gap-8 bg-white border border-black rounded-[8px] p-8 shadow-[0_6px_0_0_#000000]">

        <div className="text-center flex flex-col gap-2">
          <h1 className="text-[26px] font-bold text-black">
            تکمیل ثبت‌نام و انتخاب نقش
          </h1>

          <p className="text-[13px] text-gray-500">
            لطفاً نقش اصلی خود را در پلتفرم انتخاب کنید
          </p>
        </div>

        <div
          className={`grid gap-6 w-full ${
            hasSupervisorRole
              ? "grid-cols-3"
              : "grid-cols-2"
          }`}
        >

          {/* Freelancer */}
          <div
            onClick={() => setSelectedRole("freelancer")}
            className={`border rounded-[8px] p-5 flex flex-col gap-3 cursor-pointer transition-all ${
              selectedRole === "freelancer"
                ? "border-blue-600 bg-blue-50/50 shadow-[0_0_0_2px_#2563eb]"
                : "border-black bg-white hover:bg-gray-50 shadow-[0_3px_0_0_#000000]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-full text-2xl">
                <BiUserCheck />
              </div>

              <h3 className="text-[16px] font-bold text-black">
                فریلنسر
              </h3>
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed text-right">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
              استفاده از طراحان گرافیک است.
            </p>
          </div>

          {/* Employer */}
          <div
            onClick={() => setSelectedRole("employer")}
            className={`border rounded-[8px] p-5 flex flex-col gap-3 cursor-pointer transition-all ${
              selectedRole === "employer"
                ? "border-blue-600 bg-blue-50/50 shadow-[0_0_0_2px_#2563eb]"
                : "border-black bg-white hover:bg-gray-50 shadow-[0_3px_0_0_#000000]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full text-2xl">
                <BiBriefcaseAlt2 />
              </div>

              <h3 className="text-[16px] font-bold text-black">
                کارفرما
              </h3>
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed text-right">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
              استفاده از طراحان گرافیک است.
            </p>
          </div>

          {/* Supervisor */}
          {hasSupervisorRole && (
            <div
              onClick={() => setSelectedRole("supervisor")}
              className={`border rounded-[8px] p-5 flex flex-col gap-3 cursor-pointer transition-all ${
                selectedRole === "supervisor"
                  ? "border-blue-600 bg-blue-50/50 shadow-[0_0_0_2px_#2563eb]"
                  : "border-black bg-white hover:bg-gray-50 shadow-[0_3px_0_0_#000000]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-full text-2xl">
                  <BiShieldQuarter />
                </div>

                <h3 className="text-[16px] font-bold text-black">
                  ناظر
                </h3>
              </div>

              <p className="text-[11px] text-gray-600 leading-relaxed text-right">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
                استفاده از طراحان گرافیک است.
              </p>
            </div>
          )}

        </div>

        <button
          type="button"
          onClick={handleFinalRegister}
          disabled={isSubmitting}
          className="w-full h-[44px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[15px] font-bold shadow-[0_3px_0_0_#000000] active:translate-y-[1px] cursor-pointer mt-2 disabled:opacity-60"
        >
          {isSubmitting ? "در حال ثبت..." : "ورود به پنل کاربری"}
        </button>

      </div>
    </div>
  );
};

export default RoleSelectionPage;