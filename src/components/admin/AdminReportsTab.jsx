import React, { useState } from "react";
import DatePickerModule from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  BiLayer,
  BiTask,
  BiUser,
  BiGroup,
  BiChevronDown,
  BiCalendar,
} from "react-icons/bi";

// Vite ESM/CommonJS interop workaround
const DatePicker = DatePickerModule.default || DatePickerModule;

// Available report types
const REPORT_TYPES = [
  {
    id: "comprehensive",
    title: "گزارش جامع",
    subtitle: "گزارش جامع از پروژه‌ها",
    icon: <BiLayer className="text-2xl" />,
  },
  {
    id: "project_list",
    title: "لیست پروژه",
    subtitle: "فیلتر پیشرفته پروژه‌ها",
    icon: <BiTask className="text-2xl" />,
  },
  {
    id: "individual",
    title: "کارکرد فردی",
    subtitle: "ریز پروژه‌های یک همکار",
    icon: <BiUser className="text-2xl" />,
  },
  {
    id: "team_payment",
    title: "پرداخت تیمی",
    subtitle: "خلاصه وضعیت کلی",
    icon: <BiGroup className="text-2xl" />,
  },
];

const AdminReportsTab = () => {
  const [selectedReportType, setSelectedReportType] = useState("project_list");

  // Filter state
  const [projectStatus, setProjectStatus] = useState("همه وضعیت‌ها");
  const [paymentStatus, setPaymentStatus] = useState("تسویه نشده");
  const [dateBasis, setDateBasis] = useState("تحویل نهایی");

  // Persian (Jalali) date range
  const [fromDate, setFromDate] = useState("۱۴۰۸/۰۳/۰۴");
  const [toDate, setToDate] = useState("۱۴۰۸/۰۳/۰۴");

  // Dropdown open/close state
  const [showProjDrop, setShowProjDrop] = useState(false);
  const [showPayDrop, setShowPayDrop] = useState(false);
  const [showBasisDrop, setShowBasisDrop] = useState(false);

  // TODO(API): POST these filters to a reporting endpoint, e.g.
  // /reports/preview, and render the returned report instead of just
  // alerting.
  const handlePreviewReport = () => {
    const filters = {
      type: selectedReportType,
      projectStatus,
      paymentStatus,
      dateBasis,
      fromDate,
      toDate,
    };
    console.log("فیلترهای گزارش:", filters);
    alert("پیش‌نمایش گزارش آماده شد.");
  };

  return (
    <div
      className="w-[750px] flex flex-col gap-5 select-none"
      style={{ fontFamily: "Pinar-FD" }}
      dir="rtl"
    >
      <h3 className="text-[18px] font-bold text-black text-right">
        نوع گزارش را انتخاب کنید
      </h3>

      {/* Report-type picker cards */}
      <div className="grid grid-cols-4 gap-3 w-full">
        {REPORT_TYPES.map((item) => {
          const isSelected = selectedReportType === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedReportType(item.id)}
              className={`h-[90px] rounded-[6px] border p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isSelected
                  ? "bg-white border-blue-500 shadow-[0_0_0_1.5px_#3b82f6] text-blue-600"
                  : "bg-white border-black shadow-[0_3px_0_0_#000000] text-black hover:bg-gray-50"
              }`}
            >
              <div className="mb-1.5">{item.icon}</div>
              <span className="text-[13px] font-bold leading-tight">
                {item.title}
              </span>
              <span
                className={`text-[9.5px] mt-0.5 ${
                  isSelected ? "text-blue-500" : "text-gray-500"
                }`}
              >
                {item.subtitle}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filters box */}
      <div className="w-full bg-white border border-black rounded-[8px] p-5 shadow-[0_4px_0_0_#000000] flex flex-col gap-6">
        {/* Row 1: dropdowns */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* Project status */}
          <div className="relative w-full">
            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                وضعیت پروژه
              </legend>
              <div
                onClick={() => {
                  setShowProjDrop(!showProjDrop);
                  setShowPayDrop(false);
                  setShowBasisDrop(false);
                }}
                className="w-full flex items-center justify-between cursor-pointer text-[11px] font-bold text-black"
              >
                <BiChevronDown className="text-lg text-gray-700" />
                <span>{projectStatus}</span>
              </div>
            </fieldset>

            {showProjDrop && (
              <div className="absolute top-[46px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30 text-[11px] font-bold">
                {["همه وضعیت‌ها", "در حال انجام", "خاتمه یافته", "بایگانی"].map(
                  (st) => (
                    <div
                      key={st}
                      onClick={() => {
                        setProjectStatus(st);
                        setShowProjDrop(false);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded cursor-pointer text-right"
                    >
                      {st}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Payment status */}
          <div className="relative w-full">
            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                وضعیت پرداخت
              </legend>
              <div
                onClick={() => {
                  setShowPayDrop(!showPayDrop);
                  setShowProjDrop(false);
                  setShowBasisDrop(false);
                }}
                className="w-full flex items-center justify-between cursor-pointer text-[11px] font-bold text-black"
              >
                <BiChevronDown className="text-lg text-gray-700" />
                <span>{paymentStatus}</span>
              </div>
            </fieldset>

            {showPayDrop && (
              <div className="absolute top-[46px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30 text-[11px] font-bold">
                {["همه وضعیت‌ها", "تسویه شده", "تسویه نشده", "پیش‌پرداخت"].map(
                  (st) => (
                    <div
                      key={st}
                      onClick={() => {
                        setPaymentStatus(st);
                        setShowPayDrop(false);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded cursor-pointer text-right"
                    >
                      {st}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Report date basis */}
          <div className="relative w-full">
            <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white">
              <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
                مبنای تاریخ گزارش
              </legend>
              <div
                onClick={() => {
                  setShowBasisDrop(!showBasisDrop);
                  setShowProjDrop(false);
                  setShowPayDrop(false);
                }}
                className="w-full flex items-center justify-between cursor-pointer text-[11px] font-bold text-black"
              >
                <BiChevronDown className="text-lg text-gray-700" />
                <span>{dateBasis}</span>
              </div>
            </fieldset>

            {showBasisDrop && (
              <div className="absolute top-[46px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30 text-[11px] font-bold">
                {["تحویل نهایی", "تاریخ ثبت پروژه", "تاریخ شروع"].map((b) => (
                  <div
                    key={b}
                    onClick={() => {
                      setDateBasis(b);
                      setShowBasisDrop(false);
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded cursor-pointer text-right"
                  >
                    {b}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Jalali date range */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* To date */}
          <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white relative">
            <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
              تا تاریخ
            </legend>
            <div className="w-full flex items-center justify-between">
              <DatePicker
                value={toDate}
                onChange={(date) =>
                  setToDate(date?.format?.("YYYY/MM/DD") || date)
                }
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full bg-transparent border-none text-[12px] font-mono text-black font-bold focus:outline-none text-right"
              />
              <BiCalendar className="text-gray-700 text-lg shrink-0 pointer-events-none" />
            </div>
          </fieldset>

          {/* From date */}
          <fieldset className="border border-black rounded-[5px] px-3 h-[42px] flex items-center bg-white relative">
            <legend className="pr-1 pl-1 text-[10px] text-gray-500 font-medium text-right">
              از تاریخ
            </legend>
            <div className="w-full flex items-center justify-between">
              <DatePicker
                value={fromDate}
                onChange={(date) =>
                  setFromDate(date?.format?.("YYYY/MM/DD") || date)
                }
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full bg-transparent border-none text-[12px] font-mono text-black font-bold focus:outline-none text-right"
              />
              <BiCalendar className="text-gray-700 text-lg shrink-0 pointer-events-none" />
            </div>
          </fieldset>
        </div>

        {/* Preview button */}
        <div className="flex justify-start w-full mt-2">
          <button
            type="button"
            onClick={handlePreviewReport}
            className="w-[160px] h-[36px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2.5px_0_0_#000000] active:translate-y-[1px] cursor-pointer transition-all"
          >
            پیش نمایش گزارش
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsTab;
