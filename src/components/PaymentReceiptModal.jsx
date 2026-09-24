import React from "react";
import { BiX } from "react-icons/bi";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

const PaymentReceiptModal = ({ isOpen, onClose, txData }) => {
  if (!isOpen || !txData) return null;

  const data = {
    txnId: txData.txnId || "TXN-۱۴۰۳-۰۵-۰۰۱",
    amount: txData.amount || 8000000,
    recipientName: txData.target || "علیرضا فرقدانی",
    shaba: txData.shaba || "IR۱۲۰۵۷۰۰۰۰۰۰۱۲۳",
    projectName: txData.projectName || "طراحی سایت فروشگاهی",
    date: txData.date || "۱ خرداد ۱۴۰۳",
    status: txData.status || "پرداخت شده",
    from: txData.from || "پلتفرم فریلنسری",
  };

  // Renders the receipt directly on an HTML5 canvas and downloads it as
  // a PNG - no external library needed.
  const handleDownloadReceipt = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 800, 420);

    // Outer border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, 770, 390);

    // Header bar
    ctx.fillStyle = "#1c1c1e";
    ctx.fillRect(15, 15, 770, 50);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Tahoma, sans-serif";
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillText("رسید پرداخت دیجیتال - مِهرآ", 760, 47);

    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`# ${data.txnId}`, 35, 47);

    // Right column: financial details
    ctx.fillStyle = "#000000";
    ctx.direction = "rtl";
    ctx.textAlign = "right";

    const drawRow = (label, value, y, isBold = false) => {
      ctx.font = "13px Tahoma, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(label, 760, y);

      ctx.font = isBold
        ? "bold 15px Tahoma, sans-serif"
        : "14px Tahoma, sans-serif";
      ctx.fillStyle = "#000000";
      ctx.fillText(value, 520, y);

      ctx.strokeStyle = "#f3f4f6";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(320, y + 10);
      ctx.lineTo(760, y + 10);
      ctx.stroke();
    };

    drawRow("مبلغ انتقال:", `${formatPrice(data.amount)} تومان`, 110, true);
    drawRow("نام دریافت‌کننده:", data.recipientName, 155);
    drawRow("شماره شبا:", data.shaba, 200);
    drawRow("نام پروژه:", data.projectName, 245);
    drawRow("تاریخ پرداخت:", data.date, 290);
    drawRow("وضعیت:", data.status, 335);

    // Vertical divider
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 80);
    ctx.lineTo(300, 380);
    ctx.stroke();

    // Left column: confirmation card
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(35, 90, 240, 280);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.strokeRect(35, 90, 240, 280);

    const drawLeftRow = (label, val, y) => {
      ctx.font = "12px Tahoma, sans-serif";
      ctx.fillStyle = "#9ca3af";
      ctx.textAlign = "right";
      ctx.fillText(label, 260, y);

      ctx.fillStyle = "#111827";
      ctx.textAlign = "left";
      ctx.fillText(val, 50, y);
    };

    drawLeftRow("از:", data.from, 130);
    drawLeftRow("به:", data.recipientName, 175);
    drawLeftRow("مبلغ:", `${formatPrice(data.amount)} ت`, 220);
    drawLeftRow("تاریخ:", data.date, 265);

    // Green "confirmed" badge
    ctx.fillStyle = "#def7ec";
    ctx.fillRect(50, 310, 210, 35);
    ctx.strokeStyle = "#03543f";
    ctx.strokeRect(50, 310, 210, 35);

    ctx.fillStyle = "#03543f";
    ctx.font = "bold 13px Tahoma, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✓ تأیید شده", 155, 332);

    // Trigger the PNG download
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `Receipt-${data.txnId}.png`;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal container */}
      <div
        className="w-[820px] bg-[#1c1c1e] text-white rounded-[10px] p-4 relative z-10 flex flex-col gap-3 select-none shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
        style={{ fontFamily: "Pinar-FD" }}
      >
        {/* Modal header */}
        <div className="w-full flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 rounded-[5px] flex items-center justify-center text-xl text-gray-300 transition-all cursor-pointer"
            >
              <BiX />
            </button>
            <span className="bg-zinc-800 border border-zinc-700 text-gray-300 text-[12px] font-mono px-3 py-1 rounded-[5px]">
              # {data.txnId}
            </span>
          </div>

          <h3 className="text-[18px] font-bold text-white">جزئیات پرداخت</h3>
        </div>

        {/* Main white receipt box */}
        <div className="w-full bg-white text-black rounded-[8px] p-6 flex gap-6 items-stretch border border-black shadow-[0_4px_0_0_#000000]">
          {/* Right column: itemized financial details */}
          <div className="flex-1 flex flex-col justify-between text-right text-[13px]">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
              <span className="text-gray-400 font-medium">مبلغ انتقال:</span>
              <span className="text-[20px] font-bold text-black">
                {formatPrice(data.amount)}{" "}
                <span className="text-[14px]">تومان</span>
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 py-2.5">
              <span className="text-gray-400 font-medium">
                نام دریافت‌کننده:
              </span>
              <span className="font-bold text-black">{data.recipientName}</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 py-2.5">
              <span className="text-gray-400 font-medium">شماره شبا:</span>
              <span className="font-mono font-bold text-gray-800 dir-ltr">
                {data.shaba}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 py-2.5">
              <span className="text-gray-400 font-medium">نام پروژه:</span>
              <span className="font-bold text-black">{data.projectName}</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 py-2.5">
              <span className="text-gray-400 font-medium">تاریخ پرداخت:</span>
              <span className="font-medium text-gray-800">{data.date}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5">
              <span className="text-gray-400 font-medium">وضعیت:</span>
              <span className="bg-[#def7ec] text-[#03543f] px-3 py-1 rounded-[5px] font-bold text-[11px]">
                {data.status}
              </span>
            </div>

            {/* Right column bottom buttons */}
            <div className="flex gap-3 w-full mt-5">
              <button
                onClick={onClose}
                className="flex-1 h-[38px] border border-black bg-white text-black text-[12px] font-bold rounded-[5px] shadow-[0_2px_0_0_#000000] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                بستن
              </button>
              <button
                onClick={handleDownloadReceipt}
                className="flex-1 h-[38px] border border-black bg-[#1c1c1e] text-white text-[12px] font-bold rounded-[5px] shadow-[0_2px_0_0_#000000] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                ↓ دانلود رسید
              </button>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-[1px] bg-gray-200 self-stretch mx-1" />

          {/* Left column: confirmed-invoice-style card */}
          <div className="w-[320px] bg-gray-50 border border-gray-200 rounded-[6px] p-4 flex flex-col justify-between shrink-0">
            <div className="flex flex-col gap-3 text-[12px] text-right">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-400">از:</span>
                <span className="font-bold text-gray-800">{data.from}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-400">به:</span>
                <span className="font-bold text-gray-800">
                  {data.recipientName}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-400">مبلغ:</span>
                <span className="font-bold text-black">
                  {formatPrice(data.amount)} ت
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-400">تاریخ:</span>
                <span className="font-medium text-gray-700">{data.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">کد:</span>
                <span className="font-mono text-[11px] text-gray-600">
                  {data.txnId}
                </span>
              </div>
            </div>

            <div className="w-full bg-[#def7ec] border border-[#03543f] text-[#03543f] rounded-[5px] py-1.5 text-center text-[12px] font-bold mt-6 flex items-center justify-center gap-1">
              ✓ تأیید شده
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;
