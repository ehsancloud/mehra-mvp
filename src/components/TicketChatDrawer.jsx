import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTicket } from "../context/TicketContext";
import {
  BiChevronLeft,
  BiPaperclip,
  BiSend,
  BiFile,
  BiCheckDouble,
  BiDollarCircle,
  BiLock,
} from "react-icons/bi";
import ConvertToProjectModal from "./ConvertToProjectModal";
import EditPriceModal from "./EditPriceModal";
import {
  getTicketById,
  getTicketMessages,
  sendTicketMessage,
  deleteTicket,
  verifyFreelancer
} from "../data/api";
import { useAuthStore } from "../store/authStore";

const TicketChatDrawer = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isPrivilegedPanel =
    location.pathname.startsWith("/supervisor") ||
    location.pathname.startsWith("/admin");

  const {
    isOpen,
    closeChat,
    activeTicketId,
    activeTicketTitle,
    setIsFileModalOpen,
    setIsFinalFileModalOpen,
    refreshKey,
  } = useTicket();

  const [showAttachments, setShowAttachments] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [ticket, setTicket] = useState(null);

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isEditPriceOpen, setIsEditPriceOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !activeTicketId) return;
    let cancelled = false;

    (async () => {
      const [ticketData, messageData] = await Promise.all([
        getTicketById(activeTicketId),
        getTicketMessages(activeTicketId),
      ]);
      if (!cancelled) {
        setTicket(ticketData);
        setMessages(messageData);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeTicketId,refreshKey]);

  const isTicketClosed = ticket?.isClosed ?? false;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const result = await sendTicketMessage({
      ticketId: activeTicketId,
      text: messageText 
    });

    if (!result.ok) {
      alert("ارسال پیام با خطا مواجه شد.");
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: result.message.id,
        senderRole: user.role,
        text: messageText,
        time: result.message.time
      }
    ]);

    setMessageText("");
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm("آیا از حذف این تیکت اطمینان دارید؟")) return;
    await deleteTicket(activeTicketId);
    closeChat();
  };

  const handleVerifyFreelancer = async () => {
    const level = window.prompt("سطح فریلنسر را وارد کنید (a, b یا c):", "b");
    if (!level) return;

    const result = await verifyFreelancer(activeTicketId, {
      level,
      availableForProposals: true,
    });

    if (!result.ok) {
      alert(result.message || "خطا در احراز هویت فریلنسر.");
      return;
    }

    alert("فریلنسر با موفقیت تایید و سطح او مشخص شد!");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[98] transition-opacity duration-300"
          onClick={closeChat}
        />
      )}

      <div
        dir="rtl"
        className={`
          fixed top-0 bottom-0 left-0 w-[440px] bg-[#f8f9fa] border-r border-black z-[100]
          shadow-[4px_0_24px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ fontFamily: "Pinar-FD" }}
      >
        <div className="w-full bg-[#1c1c1e] text-white p-3.5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeChat}
              className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 cursor-pointer transition-colors"
            >
              <BiChevronLeft className="text-2xl text-white rotate-180" />
            </button>
            <div className="flex flex-col gap-0.5 text-right">
              <h4 className="text-[14px] font-bold truncate max-w-[150px]">
                {activeTicketTitle || "بدون عنوان"}
              </h4>
              <span className="text-[10px] text-gray-400">
                شناسه: #{activeTicketId || "----"}
              </span>
            </div>
          </div>

          {isPrivilegedPanel && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(true)}
                className="h-[28px] px-2 bg-white text-black text-[10px] font-bold rounded border border-black shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
              >
                تبدیل به پروژه
              </button>
              {activeTicketTitle?.includes("احراز هویت") && (user?.role === "supervisor" || user?.role === "admin") && (
              <button
                  type="button"
                  onClick={handleVerifyFreelancer}
                  className="px-3 py-1 bg-green-600 text-white rounded text-[11px] font-bold shadow cursor-pointer"
                >
                  تایید فریلنسر
              </button>
              )}
              <button
                type="button"
                onClick={handleDeleteTicket}
                className="h-[28px] px-2 bg-white text-red-600 border border-red-600 text-[10px] font-bold rounded shadow-[0_2px_0_0_#dc2626] active:translate-y-[1px] cursor-pointer"
              >
                حذف تیکت
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-none bg-gray-50">
          {messages.map((msg) => {
            const isMe = isPrivilegedPanel
              ? msg.senderRole === "supervisor"
              : msg.senderRole !== "supervisor";
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${
                  isMe ? "self-start items-start" : "self-end items-end"
                }`}
              >
                <div
                  className={`
                    p-3 rounded-[5px] border border-black text-[13px] text-black leading-relaxed shadow-[0_2px_0_0_#000000]
                    ${isMe ? "bg-[#def7ec]" : "bg-[#ebebeb]"}
                  `}
                >
                  {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}
                  {/* دکمه دانلود فایل پیوست */}
                  {msg.fileUrl && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1.5 text-blue-700 hover:text-blue-900 bg-white/60 p-2 rounded-[4px] border border-blue-200 transition-colors cursor-pointer w-fit"
                  >
                    <BiFile className="text-lg shrink-0" />
                    <span className="font-bold underline decoration-blue-300 underline-offset-4">
                      {msg.isFinalFile ? "دانلود فایل نهایی پروژه (.zip)" : "دانلود فایل پیوست (.zip)"}
                    </span>
                  </a>
                )}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                  <span>{msg.time}</span>
                  {isMe && <BiCheckDouble className="text-blue-500 text-sm" />}
                </div>
              </div>
            );
          })}
        </div>

        {isTicketClosed ? (
          <div className="p-4 bg-white border-t border-gray-200 shrink-0">
            <div className="w-full h-[42px] border border-gray-300 rounded-[5px] bg-gray-100 flex items-center justify-center gap-2 text-gray-500 text-[12px] font-bold">
              <BiLock className="text-base" />
              این تیکت بسته شده و امکان ارسال پیام جدید وجود ندارد.
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white border-t border-gray-200 relative shrink-0">
            {showAttachments && (
              <div className="absolute bottom-[75px] right-4 bg-white border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-1.5 flex flex-col w-[180px] z-50">
                {isPrivilegedPanel && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditPriceOpen(true);
                        setShowAttachments(false);
                      }}
                      className="flex items-center gap-2 text-right w-full px-3 py-2 text-[12px] text-blue-700 bg-blue-50 rounded font-bold cursor-pointer"
                    >
                      <BiDollarCircle className="text-blue-600 text-base" />
                      ویرایش هزینه فریلنسر
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsFileModalOpen(true);
                    setShowAttachments(false);
                  }}
                  className="flex items-center gap-2 text-right w-full px-3 py-2 text-[12px] text-black hover:bg-gray-50 rounded font-medium cursor-pointer"
                >
                  <BiFile className="text-gray-500 text-base" />
                  ارسال فایل معمولی
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    setIsFinalFileModalOpen(true);
                    setShowAttachments(false);
                  }}
                  className="flex items-center gap-2 text-right w-full px-3 py-2 text-[12px] text-[#03543f] bg-[#def7ec] rounded font-bold cursor-pointer"
                >
                  <BiFile className="text-[#03543f] text-base" />
                  ارسال فایل نهایی پروژه
                </button>
              </div>
            )}

            <form
              onSubmit={handleSendMessage}
              className="w-full flex items-center gap-2 relative"
            >
              <button
                type="button"
                onClick={() => setShowAttachments(!showAttachments)}
                className={`
                  w-[42px] h-[42px] border border-black rounded-[5px] flex items-center justify-center cursor-pointer transition-all
                  ${
                    showAttachments
                      ? "bg-black text-white shadow-none"
                      : "bg-white text-black shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none"
                  }
                `}
              >
                <BiPaperclip className="text-xl rotate-45" />
              </button>

              <input
                type="text"
                placeholder="پیام خود را بنویسید..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 h-[42px] border border-black rounded-[5px] px-3 text-[13px] text-black bg-white focus:outline-none placeholder-gray-400"
              />

              <button
                type="submit"
                className="w-[42px] h-[42px] bg-[#1c1c1e] text-white border border-black rounded-[5px] flex items-center justify-center cursor-pointer shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <BiSend className="text-xl rotate-180" />
              </button>
            </form>
          </div>
        )}
      </div>

      <ConvertToProjectModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        ticketTitle={activeTicketTitle}
        ticketId={activeTicketId}
      />

      <EditPriceModal
        isOpen={isEditPriceOpen}
        onClose={() => setIsEditPriceOpen(false)}
        projectId={ticket?.relatedProjectId}
      />
    </>
  );
};

export default TicketChatDrawer;