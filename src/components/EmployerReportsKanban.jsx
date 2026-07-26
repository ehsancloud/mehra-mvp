import React, { useEffect, useState } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { useTicket } from "../context/TicketContext";
import { getEmployerTaskReports, getCurrentUserId } from "../data/api";

const APPROVAL_STYLES = {
  "تأیید شده": "bg-[#def7ec] text-[#03543f]",
  "در انتظار فریلنسر": "bg-[#fde8e8] text-[#9b1c1c]",
};

const EmployerReportsKanban = () => {
  const { openChat } = useTicket();
  const [tasks, setTasks] = useState({ deposited: [], completed: [] });
  const employerId = getCurrentUserId("employer");

  useEffect(() => {
    getEmployerTaskReports({ employerId }).then(setTasks);
  }, [employerId]);

  const depositedTasks = tasks.deposited;
  const completedTasks = tasks.completed;

  return (
    <div
      dir="rtl"
      className="w-full flex flex-col gap-3"
      style={{ fontFamily: "Pinar-FD" }}
    >
      <h3 className="text-[20px] font-bold text-black text-right">گزارشات</h3>
      <div className="w-full flex gap-4 items-stretch">
        {/* Column 1: deposited */}
        <div className="flex-1 bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] overflow-hidden">
          <div className="w-full h-[6px] bg-[#b87333]" />
          <div className="p-3 flex flex-col gap-3">
            <span className="text-[13px] font-bold text-black block text-right">
              سپرده شده
            </span>

            {depositedTasks.map((task) => (
              <div
                key={task.id}
                className="w-full border border-gray-200 rounded-[5px] p-3 flex flex-col gap-2 text-right text-[11px]"
              >
                <h4 className="text-[13px] font-bold text-black">
                  {task.title}
                </h4>
                <div
                  className={`w-full p-1 rounded text-center font-bold text-[10px] ${APPROVAL_STYLES[task.approvalStatus] || "bg-gray-100 text-gray-700"}`}
                >
                  {task.approvalStatus}
                </div>
                <div className="flex justify-between text-gray-500 mt-1">
                  <span>تایید کارفرما:</span>{" "}
                  <span className="text-black font-medium">
                    {task.employerApprovalDate}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>تاریخ شروع:</span>{" "}
                  <span className="text-black font-medium">
                    {task.startDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: completed */}
        <div className="flex-1 bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] overflow-hidden">
          <div className="w-full h-[6px] bg-[#4cae4c]" />
          <div className="p-3 flex flex-col gap-3">
            <span className="text-[13px] font-bold text-black block text-right">
              انجام شده
            </span>

            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="w-full border border-gray-200 rounded-[5px] p-3 flex flex-col gap-2 text-right text-[11px]"
              >
                <h4 className="text-[13px] font-bold text-black">
                  {task.title}
                </h4>
                <div className="flex justify-between text-gray-400">
                  <span>دپارتمان:</span>{" "}
                  <span className="text-black font-medium">
                    {task.department}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>مدت زمان:</span>{" "}
                  <span className="text-black font-medium">
                    {task.duration}
                  </span>
                </div>
                <div className="w-full bg-[#def7ec] text-[#03543f] p-1 rounded text-center font-bold text-[10px] mt-1">
                  {task.settlementStatus}
                </div>
                <button
                  type="button"
                  onClick={() => openChat(task.relatedTicketId, task.title)}
                  className="text-blue-600 font-bold text-[10px] flex items-center justify-center gap-1 mt-1 cursor-pointer self-center"
                >
                  <BiLinkExternal /> هدایت به تیکت مربوطه
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerReportsKanban;
