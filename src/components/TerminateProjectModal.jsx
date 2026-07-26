import React, { useState } from "react";
import { BiX, BiStar } from "react-icons/bi";
import { terminateProject } from "../data/api";

// Shared "declare project termination + leave a review" popup. Both the
// employer and the supervisor termination actions open this same
// component (with a different `role`) so the flow and payload shape stay
// identical no matter which side closes the project.
const ROLE_COPY = {
  supervisor: {
    ratingLabel: "امتیاز ناظر به پروژه",
    commentLabel: "دلیل یا نظر ناظر جهت مختومه کردن",
  },
  employer: {
    ratingLabel: "امتیاز کارفرما به پروژه",
    commentLabel: "دلیل یا نظر کارفرما جهت مختومه کردن",
  },
};

const TerminateProjectModal = ({
  isOpen,
  onClose,
  projectId,
  role = "supervisor",
  onConfirm,
}) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const copy = ROLE_COPY[role] || ROLE_COPY.supervisor;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await terminateProject({ projectId, role, rating, comment });
    setIsSubmitting(false);

    if (!result.ok) {
      alert(result.message || "مختومه کردن پروژه با خطا مواجه شد.");
      return;
    }

    setComment("");
    setRating(5);
    if (onConfirm) onConfirm(result.project);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="w-[480px] bg-white border border-black rounded-[8px] p-5 relative z-10 flex flex-col gap-4 select-none shadow-[0_8px_0_0_#000000]"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-[16px] font-bold text-black">
            اعلام مختومیت پروژه
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl cursor-pointer"
          >
            <BiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500 font-medium">
              {copy.ratingLabel}
            </label>
            <div className="flex gap-1 text-2xl text-yellow-400 cursor-pointer justify-end">
              {[1, 2, 3, 4, 5].map((star) => (
                <BiStar
                  key={star}
                  onClick={() => setRating(star)}
                  className={
                    star <= rating ? "fill-yellow-400" : "text-gray-300"
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500 font-medium">
              {copy.commentLabel}
            </label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="توضیحات خود را بنویسید..."
              className="w-full border border-black rounded-[5px] p-2.5 text-[12px] text-black focus:outline-none resize-none bg-white placeholder-gray-400"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-5 bg-white border border-black text-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[36px] px-5 bg-[#dc2626] text-white border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "در حال ثبت..." : "ثبت و مختومه کردن"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerminateProjectModal;
