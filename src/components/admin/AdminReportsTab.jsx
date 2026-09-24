import React, { useEffect, useState } from "react";
import { getReports, getFinanceStats, previewReport } from "../../data/api";
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
  const [reports, setReports] = useState([]);
  const [financeStats, setFinanceStats] = useState(null);

  useEffect(() => {
    getReports().then((data) => setReports(data || []));
    getFinanceStats().then((data) => setFinanceStats(data || {}));
  }, []);

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

  const [reportResult, setReportResult] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handlePreviewReport = async () => {
    setIsLoadingReport(true);
    const filters = {
      type: selectedReportType,
      projectStatus,
      paymentStatus,
      dateBasis,
      fromDate,
      toDate,
    };
    const res = await previewReport(filters);
    setIsLoadingReport(false);
    if (res.ok) {
      setReportResult(res.report);
    } else {
      alert(res.message || "خطا در دریافت گزارش");
    }
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
      
      <div className="w-[300px] flex flex-col gap-3">
        <div className="bg-white border border-black rounded-[5px] p-4 shadow-[0_3px_0_0_#000000] text-right">
          <span className="text-[12px] font-bold text-gray-600 block mb-2">مجموع مبالغ بلاک شده</span>
          <span className="text-[20px] font-bold text-blue-600">
            {financeStats?.totalBlocked?.toLocaleString("fa-IR") || 0} تومان
          </span>
        </div>
        <div className="bg-white border border-black rounded-[5px] p-4 shadow-[0_3px_0_0_#000000] text-right">
          <span className="text-[12px] font-bold text-gray-600 block mb-2">مبالغ آزاد شده این ماه</span>
          <span className="text-[20px] font-bold text-green-600">
            {financeStats?.releasedThisMonth?.toLocaleString("fa-IR") || 0} تومان
          </span>
        </div>
      </div>
      <div className="flex-1 bg-white border border-black rounded-[5px] p-4 shadow-[0_4px_0_0_#000000] min-h-[300px]">
        <h3 className="text-[16px] font-bold text-black mb-4 text-right border-b pb-2">گزارشات سیستمی</h3>
        <div className="flex flex-col gap-3">
          {reports.map((rep) => (
            <div key={rep.id || rep._id} className="bg-gray-50 border border-gray-200 rounded p-3 text-right">
              <span className="block font-bold text-[12px] text-black mb-1">{rep.title}</span>
              <p className="text-[11px] text-gray-600 leading-relaxed">{rep.text}</p>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="text-center text-gray-400 text-[11px] py-4">گزارش جدیدی یافت نشد.</div>
          )}
        </div>
      </div>
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
            disabled={isLoadingReport}
            onClick={handlePreviewReport}
            className="w-[160px] h-[36px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2.5px_0_0_#000000] active:translate-y-[1px] cursor-pointer transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoadingReport ? "در حال دریافت..." : "پیش نمایش گزارش"}
          </button>
        </div>
      </div>
      
      {/* نتیجه گزارش */}
      {reportResult && (
        <div className="w-full bg-white border border-black rounded-[8px] p-5 shadow-[0_4px_0_0_#000000]">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h4 className="text-[14px] font-bold">نتیجه گزارش</h4>
            <span className="text-[10px] text-gray-500">
              {new Date(reportResult.generatedAt).toLocaleDateString("fa-IR")}
            </span>
          </div>
          
          {/* خلاصه آماری */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded p-3 text-center">
              <span className="text-[10px] text-gray-500 block">تعداد پروژه</span>
              <span className="text-[16px] font-bold">{reportResult.summary?.totalProjects?.toLocaleString("fa-IR") || 0}</span>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <span className="text-[10px] text-gray-500 block">مجموع بودجه</span>
              <span className="text-[16px] font-bold">{reportResult.summary?.totalBudget?.toLocaleString("fa-IR") || 0}</span>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <span className="text-[10px] text-gray-500 block">میانگین بودجه</span>
              <span className="text-[16px] font-bold">{reportResult.summary?.avgBudget?.toLocaleString("fa-IR") || 0}</span>
            </div>
          </div>
          
          {/* جدول پروژه‌ها */}
          {reportResult.items?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-right">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">عنوان</th>
                    <th className="p-2">وضعیت</th>
                    <th className="p-2">بودجه</th>
                    <th className="p-2">پرداخت شده</th>
                    <th className="p-2">کارفرما</th>
                    <th className="p-2">ناظر</th>
                  </tr>
                </thead>
                <tbody>
                  {reportResult.items.map((item, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{item.title}</td>
                      <td className="p-2">{item.status}</td>
                      <td className="p-2">{item.budget?.toLocaleString("fa-IR")}</td>
                      <td className="p-2">{item.paidAmount?.toLocaleString("fa-IR")}</td>
                      <td className="p-2">{item.employer}</td>
                      <td className="p-2">{item.supervisor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {reportResult.items?.length === 0 && (
            <div className="text-center text-gray-400 text-[12px] py-6">
              پروژه‌ای با این فیلترها یافت نشد.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReportsTab;
