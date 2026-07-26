import React, { useEffect, useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { getUsers, releaseFinanceTransaction } from "../data/api";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

const ReleasePaymentModal = ({ isOpen, onClose, project, onReleased }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [amount, setAmount] = useState("");
  const [selectedFreelancer, setSelectedFreelancer] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getUsers({ role: "freelancer" }).then((list) =>
      setFreelancers(list.map((f) => `${f.firstName} ${f.lastName}`)),
    );
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !selectedFreelancer) {
      alert("لطفاً مبلغ و فریلنسر مقصد را مشخص کنید.");
      return;
    }

    setIsSubmitting(true);
    const result = await releaseFinanceTransaction({
      financeProjectId: project.id,
      amount,
      freelancerName: selectedFreelancer,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      alert("آزادسازی وجه با خطا مواجه شد.");
      return;
    }

    alert(`مبلغ ${amount} تومان با موفقیت به حساب ${selectedFreelancer} منتقل شد.`);
    if (onReleased) {
      onReleased({
        ...project,
        transactions: [...project.transactions, result.transaction],
      });
    }
    setAmount("");
    setSelectedFreelancer("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="w-[440px] bg-white border border-black rounded-[5px] shadow-[0_6px_0_0_#000000] p-6 relative z-10 flex flex-col gap-5 select-none"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <h3 className="text-[16px] font-bold text-black text-center border-b border-gray-100 pb-3">
          آزادسازی و انتقال وجه به فریلنسر
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-gray-100 border border-gray-300 rounded-[5px] p-3 text-[13px]">
            <span className="text-gray-600">مبلغ کل پروژه:</span>
            <span className="font-bold text-black text-[15px]">
              {formatPrice(project.totalAmount)} تومان
            </span>
          </div>

          <div className="relative w-full mt-1">
            <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
              مبلغ آزادسازی (تومان)
            </label>
            <input
              type="text"
              placeholder="مثلاً ۸,۰۰۰,۰۰۰"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-[42px] border border-black rounded-[5px] px-3 text-[13px] text-black focus:outline-none bg-white font-mono"
            />
          </div>

          <div className="relative w-full mt-1">
            <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
              به حساب:
            </label>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full h-[42px] border border-black rounded-[5px] px-3 flex items-center justify-between text-[13px] bg-white cursor-pointer"
            >
              <span
                className={
                  selectedFreelancer ? "text-black font-bold" : "text-gray-400"
                }
              >
                {selectedFreelancer || "انتخاب فریلنسر از لیست..."}
              </span>
              <BiChevronDown className="text-xl" />
            </div>

            {showDropdown && (
              <div className="absolute top-[46px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30 max-h-[160px] overflow-y-auto">
                {freelancers.map((f) => (
                  <div
                    key={f}
                    onClick={() => {
                      setSelectedFreelancer(f);
                      setShowDropdown(false);
                    }}
                    className="px-3 py-2 text-[12px] hover:bg-gray-100 rounded cursor-pointer text-right font-medium text-black"
                  >
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full border-t border-gray-100 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[38px] border border-black bg-white text-black text-[13px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              کنسل
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-[38px] border border-black bg-[#1c1c1e] text-white text-[13px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? "در حال ثبت..." : "تایید و انتقال"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReleasePaymentModal;
