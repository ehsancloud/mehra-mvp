import React, { useRef, useState } from "react";
import { useTicket } from "../context/TicketContext";
import { BiCloudUpload, BiFile } from "react-icons/bi";
import { uploadFile, sendTicketMessage } from "../data/api";

export const FileUploadModals = () => {
const {
  activeTicketId,
  isFileModalOpen, setIsFileModalOpen,
  isFinalFileModalOpen, setIsFinalFileModalOpen,
  triggerChatRefresh
} = useTicket();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Clean up object URL when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isFileModalOpen && !isFinalFileModalOpen) return null;

  const isFinal = isFinalFileModalOpen;
  
  const resetState = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    setIsDraggingOver(false);
  };

  const handleClose = () => {
    setIsFileModalOpen(false);
    setIsFinalFileModalOpen(false);
    resetState();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      return alert("لطفاً ابتدا یک فایل انتخاب کنید.");
    }
    
    if (!activeTicketId) {
      return alert("خطا: شناسه تیکت یافت نشد! لطفاً چت را بسته و دوباره باز کنید.");
    }

    setIsUploading(true);

    try {
      const uploadRes = await uploadFile(selectedFile);
      
      if (!uploadRes.ok) {
        alert("خطا در آپلود فایل در سرور.");
        setIsUploading(false);
        return;
      }

      let messageText = isFinal ? "فایل نهایی پروژه ارسال شد." : "فایل پیوست جدید.";
      if (isFinal && (title || description)) {
         messageText += `\nعنوان: ${title}\nتوضیحات: ${description}`;
      }

      const messageRes = await sendTicketMessage({
        ticketId: activeTicketId,
        text: messageText,
        fileUrl: uploadRes.url,
        isFinalFile: isFinal,
      });

      if (!messageRes.ok) {
        alert("فایل آپلود شد اما در ارسال پیام خطایی رخ داد.");
      } else {
        triggerChatRefresh();
        handleClose();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("خطای غیرمنتظره‌ای رخ داد.");
    } finally {
      setIsUploading(false);
    }
  };
  
  const canSubmit = isFinal
    ? Boolean(selectedFile && title.trim())
    : Boolean(selectedFile);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={handleClose} />

      <div
        className="w-[396px] bg-white border border-black rounded-[5px] shadow-[0_6px_0_0_#000000] p-5 relative z-10 flex flex-col gap-5 select-none"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <h3 className="text-[16px] font-bold text-black text-center border-b border-gray-100 pb-3">
          {isFinal ? "ارسال فایل نهایی" : "ارسال فایل"}
        </h3>

        {isFinal && (
          <div className="flex flex-col gap-4 w-full">
            <div className="relative w-full mt-2">
              <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
                عنوان
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-[42px] border border-black rounded-[5px] px-3 text-[13px] text-black focus:outline-none"
              />
            </div>
            <div className="relative w-full mt-2">
              <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
                توضیحات
              </label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-black rounded-[5px] p-3 text-[13px] text-black focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`
          w-full border rounded-[5px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
          ${isDraggingOver ? "border-black bg-gray-50 border-solid" : "border-dashed border-gray-400 hover:bg-gray-50/50"}
          ${isFinal ? "h-[100px]" : "h-[230px]"}
        `}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2 p-3 w-full">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="max-h-[120px] max-w-full rounded border border-gray-200 object-contain"
                />
              ) : (
                <BiFile className="text-[44px] text-black" />
              )}
              <span className="text-[12px] text-black font-medium px-4 text-center truncate max-w-full">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
              <span className="text-[10px] text-gray-400">
                برای تغییر فایل کلیک کنید
              </span>
            </div>
          ) : (
            <>
              <BiCloudUpload className="text-[44px] text-black" />
              <span className="text-[12px] text-gray-500 font-medium">
                فایل خود را در این کادر بکشید
              </span>
            </>
          )}
        </div>

        <div className="flex gap-3 w-full border-t border-gray-100 pt-4">
          <button
            onClick={handleClose}
            className="flex-1 h-[38px] border border-black bg-white text-black text-[13px] font-medium rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            لغو
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isUploading}
            className={`flex-1 h-[38px] border border-black text-white text-[13px] font-medium rounded-[5px] transition-all ${
              canSubmit && !isUploading
                ? "bg-[#1c1c1e] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-60"
            }`}
          >
            {isUploading ? "در حال آپلود..." : "ارسال فایل"}
          </button>
        </div>
      </div>
    </div>
  );
};