import React, { useEffect, useState } from "react";
import { getWallet, chargeWallet } from "../data/api";
import { useAuthStore } from "../store/authStore";

const formatPrice = (price) => price.toLocaleString("fa-IR").replace(/٬/g, "،");

const EmployerWalletWidget = () => {
  const [balance, setBalance] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      getWallet(user.id).then(res => setBalance(res.balance));
    }
  }, [user]);
  const handleCharge = async () => {
    const amount = window.prompt("مبلغ شارژ (تومان) را وارد کنید:", "1000000");
    if (!amount) return;
    
    const res = await chargeWallet({ employerId: user.id, amount });
    if (res.ok) {
      setBalance(res.balance);
      alert("کیف پول با موفقیت شارژ شد.");
    }
  };

  return (
    <div dir="rtl" className="w-[180px]" style={{ fontFamily: "Pinar-FD" }}>
      <h3 className="text-[20px] font-bold text-black mb-3 text-right">
        کیف پول
      </h3>
      <div className="w-full h-[220px] bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-4 flex flex-col justify-between items-center">
        <div className="w-full text-right flex flex-col gap-1">
          <span className="text-[11px] text-gray-500">موجودی کیف پول :</span>
          <div className="text-center mt-4">
            <span className="text-[26px] font-bold text-black">
              {formatPrice(balance)}
            </span>
            <span className="text-[12px] text-gray-600 mr-1 block">تومان</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCharge}
          className="w-full h-[36px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[12px] font-bold shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          افزایش اعتبار
        </button>
      </div>
    </div>
  );
};

export default EmployerWalletWidget;
