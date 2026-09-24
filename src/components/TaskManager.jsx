import React, { useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import { getTaskBoard } from "../data/api";
import { useAuthStore } from "../store/authStore";

const EMPTY_BOARD = { deposited: [], suggestions: [], completed: [] };

const TaskManager = () => {
  const [board, setBoard] = useState(EMPTY_BOARD);
  
  // استفاده از استور به جای تابع منسوخ
  const { user: currentFreelancer } = useAuthStore();
  const freelancerId = currentFreelancer?.id || currentFreelancer?._id;

  useEffect(() => {
    if (freelancerId) {
      getTaskBoard({ freelancerId }).then(setBoard);
    }
  }, [freelancerId]);

  return (
    <div dir="rtl" className="w-full" style={{ fontFamily: "Pinar-FD" }}>
      <h3 className="text-[22px] font-bold text-black mb-3 text-right">
        تسک منیجر
      </h3>

      <div className="grid grid-cols-3 gap-4 w-full items-start">
        <div className="bg-white border-t-[4px] border-[#b08554] rounded-t-[4px] rounded-b-[5px] border-x border-b border-gray-300 p-3 flex flex-col gap-3 min-h-[300px] shadow-sm">
          <div className="text-center font-medium text-[13px] text-gray-500 pb-1 border-b border-gray-100">
            سپرده شده
          </div>
          {board.deposited.map((task) => (
            <TaskCard key={task.id} task={task} columnType="deposited" />
          ))}
        </div>

        <div className="bg-white border-t-[4px] border-[#3c78d3] rounded-t-[4px] rounded-b-[5px] border-x border-b border-gray-300 p-3 flex flex-col gap-3 min-h-[300px] shadow-sm">
          <div className="text-center font-medium text-[13px] text-gray-500 pb-1 border-b border-gray-100">
            پیشنهادات
          </div>
          {board.suggestions.map((task) => (
            <TaskCard key={task.id} task={task} columnType="suggestions" />
          ))}
        </div>

        <div className="bg-white border-t-[4px] border-[#6aa84f] rounded-t-[4px] rounded-b-[5px] border-x border-b border-gray-300 p-3 flex flex-col gap-3 min-h-[300px] shadow-sm">
          <div className="text-center font-medium text-[13px] text-gray-500 pb-1 border-b border-gray-100">
            انجام شده
          </div>
          {board.completed.map((task) => (
            <TaskCard key={task.id} task={task} columnType="completed" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;