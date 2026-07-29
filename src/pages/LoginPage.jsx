import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../data/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setIsSubmitting(true);
    setError("");
    const result = await login({ identifier, password });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate(result.redirectPath);
  };

  return (
    <div
      className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4 select-none"
      dir="rtl"
      style={{ fontFamily: "Pinar-FD" }}
    >
      <div className="w-[380px] flex flex-col items-center gap-6">
        <h1 className="text-[32px] font-bold text-black text-center">ورود</h1>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          {error && (
            <div className="w-full p-2.5 bg-red-100 border border-red-400 text-red-700 rounded text-[11px] text-center font-bold">
              {error}
            </div>
          )}

          {/* اینپوت شناسه (چپ‌چین شده) */}
          <div className="relative w-full">
            <fieldset className="border border-black rounded-[5px] px-3 h-[48px] flex items-center bg-white shadow-[0_2px_0_0_#000000]">
              <legend className="pr-1 pl-1 text-[11px] text-gray-500 font-medium text-right">
                نام کاربری / شماره همراه / ایمیل
              </legend>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[13px] text-black font-bold text-left dir-ltr"
                required
              />
            </fieldset>
          </div>

          {/* اینپوت رمز عبور (چپ‌چین شده) */}
          <div className="relative w-full">
            <fieldset className="border border-black rounded-[5px] px-3 h-[48px] flex items-center bg-white shadow-[0_2px_0_0_#000000]">
              <legend className="pr-1 pl-1 text-[11px] text-gray-500 font-medium text-right">
                رمز عبور
              </legend>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[13px] text-black font-bold text-left dir-ltr"
                required
              />
            </fieldset>
            <a
              href="#forgot"
              className="text-[11px] text-blue-600 hover:underline block text-right mt-1.5 font-medium"
            >
              رمز عبور خود را فراموش کرده ام
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[46px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[16px] font-bold shadow-[0_3.5px_0_0_#000000] active:translate-y-[1.5px] cursor-pointer mt-2 disabled:opacity-60"
          >
            {isSubmitting ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <div className="text-[12px] text-gray-600 flex items-center gap-1 font-medium">
          <span>حساب کاربری نداری ؟</span>
          <Link
            to="/register"
            className="text-blue-600 font-bold hover:underline"
          >
            یکی بساز
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
