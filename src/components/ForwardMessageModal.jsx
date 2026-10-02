import React, { useEffect, useState } from "react";
import { BiX, BiSearch } from "react-icons/bi";
import { getTickets } from "../data/api";

const ForwardMessageModal = ({ isOpen, onClose, onForward }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getTickets()
      .then((res) => {
        const list = Array.isArray(res) ? res : res.tickets || [];
        setTickets(list);
        setFilteredTickets(list);
      })
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (search.trim()) {
      setFilteredTickets(
        tickets.filter((t) =>
          t.title?.toLowerCase().includes(search.toLowerCase()) ||
          t.id?.toString().includes(search)
        )
      );
    } else {
      setFilteredTickets(tickets);
    }
  }, [search, tickets]);

  if (!isOpen) return null;

  const handleForward = () => {
    if (!selectedTicketId) return;
    onForward(selectedTicketId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-[#f2f2f7] w-full max-w-[400px] rounded-[10px] shadow-[0_4px_0_0_#000000] border-2 border-black relative z-10 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <h2 className="text-[15px] font-black text-black">فوروارد پیام</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-black rounded-[5px] text-red-600 shadow-[0_2px_0_0_#000000] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <BiX className="text-xl" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-hidden flex flex-col gap-3">
          <div className="relative">
            <BiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="جستجو در تیکت‌ها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[40px] pl-3 pr-10 border border-black rounded-[5px] text-[12px] focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto bg-white border border-black rounded-[5px] flex flex-col gap-1 p-2">
            {isLoading ? (
              <p className="text-center text-[12px] text-gray-500 py-4">در حال بارگذاری...</p>
            ) : filteredTickets.length === 0 ? (
              <p className="text-center text-[12px] text-gray-500 py-4">تیکتی یافت نشد.</p>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-2 rounded-[5px] cursor-pointer text-[12px] flex flex-col gap-1 border border-transparent transition-all ${
                    selectedTicketId === t.id
                      ? "bg-blue-100 border-blue-400"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="font-bold text-black flex justify-between">
                    <span>{t.title}</span>
                    <span className="text-gray-500 font-mono text-[10px]">#{t.id}</span>
                  </div>
                  <div className="text-gray-500 text-[10px]">{t.department}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-300 flex justify-end">
          <button
            onClick={handleForward}
            disabled={!selectedTicketId}
            className="px-6 h-[38px] bg-blue-600 text-white font-bold rounded-[5px] border border-black shadow-[0_2px_0_0_#000000] disabled:opacity-50"
          >
            ارسال به این تیکت
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessageModal;
