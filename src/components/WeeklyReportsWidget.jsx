import { BiCheckCircle, BiCreditCard, BiWallet } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useTicket } from "../context/TicketContext";
import React, { useEffect, useState } from "react";
import { getReports } from "../data/api";
import { useAuthStore } from "../store/authStore";

// Presentation (icon/background) derived from the report's `type`, so the
// backend only ever needs to send the type string, never CSS/JSX.
const TYPE_PRESENTATION = {
  project: { bg: "bg-[#def7ec]", icon: <BiCheckCircle className="text-xl text-black" /> },
  ticket: { bg: "bg-[#e1effe]", icon: <BiCreditCard className="text-xl text-black" /> },
  wallet: { bg: "bg-[#fdf6b2]", icon: <BiWallet className="text-xl text-black" /> },
};

const WeeklyReportsWidget = () => {
  const navigate = useNavigate();
  const { openChat } = useTicket();
  const [reports, setReports] = useState([]);
  const { user } = useAuthStore();
  useEffect(() => {
    getReports().then(setReports);
  }, []);
  useEffect(() => {
    if (user) {
      getReports().then(setReports);
    }
  }, [user]);
  
  const handleReportAction = (report) => {
    if (report.type === "project") {
      navigate(report.relatedProjectPath);
    } else if (report.type === "ticket") {
      openChat(report.relatedTicketId, report.relatedTicketTitle);
    }
  };

  return (
    <div dir="rtl" className="w-[240px]" style={{ fontFamily: "Pinar-FD" }}>
      <h3 className="text-[20px] font-bold text-black mb-3 text-right">
        گزارشات هفته اخیر
      </h3>
      <div className="w-full bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-3 flex flex-col gap-3">
        {reports.map((rep) => {
          const presentation = TYPE_PRESENTATION[rep.type] || TYPE_PRESENTATION.wallet;
          return (
            <div
              key={rep.id}
              className={`w-full border border-black rounded-[5px] p-2.5 flex flex-col gap-1.5 relative ${presentation.bg}`}
            >
              <div className="absolute top-2 left-2">{presentation.icon}</div>
              <h4 className="text-[12px] font-bold text-black text-right pl-6">
                {rep.title}
              </h4>
              <p className="text-[10px] text-gray-700 text-right leading-relaxed">
                {rep.text}
              </p>
              {rep.btnText && (
                <button
                  type="button"
                  onClick={() => handleReportAction(rep)}
                  className="h-[24px] px-3 bg-white border border-black rounded-[4px] text-[10px] font-bold text-black self-center mt-1 cursor-pointer shadow-[0_1.5px_0_0_#000000] active:translate-y-[1px] active:shadow-none"
                >
                  {rep.btnText}
                </button>
              )}
            </div>
          );
        })}

        {reports.length === 0 && (
          <p className="text-center text-gray-400 text-[11px] py-4">
            گزارشی برای این هفته ثبت نشده است.
          </p>
        )}
      </div>
    </div>
  );
};

export default WeeklyReportsWidget;
