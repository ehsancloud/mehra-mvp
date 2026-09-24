import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DatePickerModule from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { register } from "../data/api";

const DatePicker = DatePickerModule.default || DatePickerModule;

const PROVINCES = [
  { name: "تهران", cities: ["تهران", "شهریار", "ری"] },
  { name: "اصفهان", cities: ["اصفهان", "کاشان", "نجف‌آباد"] },
  { name: "خراسان رضوی", cities: ["مشهد", "نیشابور", "سبزوار"] },
  { name: "فارس", cities: ["شیراز", "مرودشت", "جهرم"] },
];

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationalCode: "",
    birthDate: "۱۳۷۸/۰۱/۰۱",
    province: "تهران",
    city: "تهران",
    education: "کارشناسی",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (formData.password.length < 6) {
      return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
    }
    if (formData.password !== formData.confirmPassword) {
      return "رمز عبور و تکرار آن یکسان نیستند.";
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      return "ایمیل واردشده معتبر نیست.";
    }
    if (
      !/^0\d{10}$/.test(
        formData.phone.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
      )
    ) {
      return "شماره همراه باید ۱۱ رقم و با صفر شروع شود.";
    }
    if (formData.nationalCode.trim().length !== 10) {
      return "کد ملی باید ۱۰ رقم باشد.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");
    const result = await register(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate("/role-selection", {
      state: { formData, tempUserId: result.tempUserId },
    });
  };

  return (
    <div
      className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-6 select-none"
      dir="rtl"
      style={{ fontFamily: "Pinar-FD" }}
    >
      <div className="w-[620px] flex flex-col items-center gap-6">
        <h1 className="text-[28px] font-bold text-black text-center">
          ثبت نام
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {error && (
            <div className="w-full p-2.5 bg-red-100 border border-red-400 text-red-700 rounded text-[11px] text-center font-bold">
              {error}
            </div>
          )}

          {/* ردیف ۱: نام (راست‌چین) + ایمیل (چپ‌چین) */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                نام
              </legend>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-right"
                required
              />
            </fieldset>

            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                ایمیل
              </legend>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-transparent border-none outline-none text-[12px] font-mono font-bold text-left dir-ltr"
                required
              />
            </fieldset>
          </div>

          {/* ردیف ۲: نام خانوادگی (راست‌چین) + رمز عبور (چپ‌چین) */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                نام خانوادگی
              </legend>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-right"
                required
              />
            </fieldset>

            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                رمز عبور
              </legend>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-left dir-ltr"
                required
              />
            </fieldset>
          </div>

          {/* ردیف ۳: شماره همراه (چپ‌چین) + تکرار رمز عبور (چپ‌چین) */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                شماره همراه
              </legend>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full bg-transparent border-none outline-none text-[12px] font-mono font-bold text-left dir-ltr"
                required
              />
            </fieldset>

            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                تکرار رمز عبور
              </legend>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-left dir-ltr"
                required
              />
            </fieldset>
          </div>

          {/* ردیف ۴: کد ملی (چپ‌چین) + تاریخ تولد شمسی */}
          <div className="grid grid-cols-2 gap-4">
            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                کد ملی
              </legend>
              <input
                type="text"
                value={formData.nationalCode}
                onChange={(e) =>
                  setFormData({ ...formData, nationalCode: e.target.value })
                }
                className="w-full bg-transparent border-none outline-none text-[12px] font-mono font-bold text-left dir-ltr"
                required
              />
            </fieldset>

            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                تاریخ تولد (شمسی)
              </legend>

              <DatePicker
                value={formData.birthDate}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    birthDate: date?.format?.("YYYY/MM/DD") || date,
                  })
                }
                calendar={persian}
                locale={persian_fa}
                inputClass="w-full bg-transparent border-none text-[12px] font-mono text-black font-bold focus:outline-none text-center"
              />
            </fieldset>
          </div>

          {/* ردیف ۵: استان، شهر، تحصیلات */}
          <div className="grid grid-cols-3 gap-3">
            <fieldset className="border border-black rounded-[5px] px-2 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                استان
              </legend>
              <select
                value={formData.province}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    province: e.target.value,
                    city:
                      PROVINCES.find((p) => p.name === e.target.value)
                        ?.cities[0] || "",
                  })
                }
                className="w-full bg-transparent border-none outline-none text-[11px] font-bold text-right"
              >
                {PROVINCES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </fieldset>

            <fieldset className="border border-black rounded-[5px] px-2 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                شهر
              </legend>
              <select
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full bg-transparent border-none outline-none text-[11px] font-bold text-right"
              >
                {(
                  PROVINCES.find((p) => p.name === formData.province)?.cities ||
                  []
                ).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </fieldset>

            <fieldset className="border border-black rounded-[5px] px-2 h-[42px] flex items-center bg-white shadow-sm">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                تحصیلات
              </legend>
              <select
                value={formData.education}
                onChange={(e) =>
                  setFormData({ ...formData, education: e.target.value })
                }
                className="w-full bg-transparent border-none outline-none text-[11px] font-bold text-right"
              >
                {["دیپلم", "کاردانی", "کارشناسی", "کارشناسی ارشد", "دکتری"].map(
                  (ed) => (
                    <option key={ed} value={ed}>
                      {ed}
                    </option>
                  ),
                )}
              </select>
            </fieldset>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[46px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[16px] font-bold shadow-[0_3.5px_0_0_#000000] active:translate-y-[1.5px] cursor-pointer mt-4 disabled:opacity-60"
          >
            {isSubmitting ? "در حال بررسی..." : "ثبت نام"}
          </button>
        </form>

        <div className="text-[12px] text-gray-600 flex items-center gap-1 font-medium">
          <span>حساب کاربری داری ؟</span>
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            وارد حساب شو
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
