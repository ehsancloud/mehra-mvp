import React, { useRef, useState } from "react";
import { useTicket } from "../context/TicketContext";
import { BiCloudUpload, BiFile } from "react-icons/bi";

export const FileUploadModals = () => {
  const {
    isFileModalOpen,
    setIsFileModalOpen,
    isFinalFileModalOpen,
    setIsFinalFileModalOpen,
    activeTicketId,
  } = useTicket();

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  if (!isFileModalOpen && !isFinalFileModalOpen) return null;

  const isFinal = isFinalFileModalOpen;

  const resetState = () => {
    setSelectedFile(null);
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
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // TODO(API): send `selectedFile` (and title/description for the final
  // deliverable) to the backend, e.g. as multipart/form-data to
  // POST /tickets/{activeTicketId}/attachments, then close on success.
  const handleSubmit = () => {
    if (!selectedFile) return;

    console.log("Submitting file for ticket:", activeTicketId, {
      file: selectedFile,
      ...(isFinal ? { title, description } : {}),
    });

    handleClose();
  };

  const canSubmit = isFinal
    ? Boolean(selectedFile && title.trim())
    : Boolean(selectedFile);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div
        className="w-[396px] bg-white border border-black rounded-[5px] shadow-[0_6px_0_0_#000000] p-5 relative z-10 flex flex-col gap-5 select-none"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <h3 className="text-[16px] font-bold text-black text-center border-b border-gray-100 pb-3">
          {isFinal ? "ارسال فایل نهایی" : "ارسال فایل"}
        </h3>

        {/* Title/description fields: final deliverable only */}
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

        {/* Hidden native file input, triggered by the dropzone below */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Drag-and-drop / click-to-browse zone */}
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
            <>
              <BiFile className="text-[36px] text-black" />
              <span className="text-[12px] text-black font-medium px-4 text-center truncate max-w-full">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-gray-400">
                برای تغییر فایل کلیک کنید
              </span>
            </>
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
            disabled={!canSubmit}
            className={`flex-1 h-[38px] border border-black text-white text-[13px] font-medium rounded-[5px] transition-all ${canSubmit ? "bg-[#1c1c1e] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none cursor-pointer" : "bg-gray-400 cursor-not-allowed opacity-60"}`}
          >
            ارسال فایل
          </button>
        </div>
      </div>
    </div>
  );
};
