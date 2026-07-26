import React, { useState } from "react";
import { editProjectPrice } from "../data/api";

// Opens on top of the ticket chat drawer (supervisor/admin only), so its
// z-index must stay above the chat drawer's (z-[100]/z-[98] overlay) -
// otherwise this popup would render invisibly behind the open chat.
const EditPriceModal = ({ isOpen, onClose, projectId }) => {
  const [price, setPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!price.trim()) return;
    setIsSaving(true);
    const result = await editProjectPrice({ projectId, newPrice: price });
    setIsSaving(false);

    if (!result.ok) {
      alert(result.message || "ثبت هزینه جدید با خطا مواجه شد.");
      return;
    }

    alert(`مبلغ جدید پروژه فریلنسر (${price} تومان) ثبت شد.`);
    setPrice("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="w-[320px] bg-white border border-black rounded-[5px] shadow-[0_5px_0_0_#000000] p-4 relative z-10 flex flex-col gap-3 select-none"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <h4 className="text-[13px] font-bold text-black border-b border-gray-100 pb-2 text-right">
          ویرایش هزینه پروژه فریلنسر
        </h4>

        <div className="relative w-full mt-1 text-right">
          <label className="absolute -top-[9px] right-3 bg-white px-1 text-[10px] text-gray-500 font-medium">
            مبلغ جدید (تومان)
          </label>
          <input
            type="text"
            placeholder="مثلاً 12,000,000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full h-[38px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white font-mono"
          />
        </div>

        <div className="flex gap-2 w-full mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[32px] border border-black bg-white text-black text-[11px] font-bold rounded-[4px]"
          >
            لغو
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !price.trim()}
            className="flex-1 h-[32px] border border-black bg-[#1c1c1e] text-white text-[11px] font-bold rounded-[4px] disabled:opacity-60"
          >
            {isSaving ? "در حال ثبت..." : "ثبت قیمت"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPriceModal;
