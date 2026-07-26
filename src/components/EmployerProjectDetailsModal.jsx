import React, { useEffect, useState } from "react";
import {
  BiX,
  BiMessageSquareDetail,
  BiStar,
  BiChevronLeft,
  BiReceipt,
} from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { useTicket } from "../context/TicketContext";
import TerminateProjectModal from "./TerminateProjectModal";
import { addProjectPayment, addProjectReview, getProjectById } from "../data/api";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

const EmployerProjectDetailsModal = ({ isOpen, onClose, project, onUpdated }) => {
  const { openChat } = useTicket();

  const [rating, setRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [payTitle, setPayTitle] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setReviews(project?.reviews || []);
  }, [project]);

  if (!isOpen || !project) return null;

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || rating === 0) return;
    const result = await addProjectReview({
      projectId: project.id,
      role: "employer",
      rating,
      comment: commentText,
    });
    if (result.ok) {
      setReviews((prev) => [...prev, result.review]);
    }
    setCommentText("");
    setRating(0);
  };

  const handleSubmitPayment = async () => {
    if (!payTitle.trim() || !payAmount.trim()) return;
    const result = await addProjectPayment({
      projectId: project.id,
      title: payTitle,
      amount: payAmount,
    });
    if (result.ok && onUpdated) {
      const refreshed = await getProjectById(project.id);
      onUpdated(refreshed);
    }
    setPayTitle("");
    setPayAmount("");
  };

  // TODO(API): replace with a real invoice fetch/download, e.g.
  // GET /projects/{id}/payments/{paymentId}/invoice
  const handleViewPayment = (payment) => {
    console.log("View payment details:", payment.id);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`bg-white border rounded-[5px] p-6 relative z-10 flex flex-col gap-5 select-none max-h-[92vh] overflow-y-auto scrollbar-none
          ${project.isSuperProject ? "w-[750px] border-[#3b82f6]" : "w-[750px] border-black shadow-[0_6px_0_0_#000000]"}
        `}
        style={{ fontFamily: "Pinar-FD" }}
      >
        {project.isSuperProject && (
          <span className="absolute top-0 right-6 bg-[#3b82f6] text-white text-[11px] font-bold px-3 py-1 rounded-b-[4px]">
            ابر پروژه
          </span>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl cursor-pointer"
        >
          <BiX />
        </button>

        <div className="w-full flex gap-6 items-start mt-2">
          <div className="flex-1 flex flex-col gap-5">
            <h2 className="text-[22px] font-bold text-black text-right">
              {project.title}
            </h2>

            <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-[12px] text-right">
              <div>
                <span className="text-gray-400 block mb-0.5">ناظر پروژه</span>
                <span className="font-bold text-black flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[10px]">
                    {project.supervisorInitial}
                  </span>
                  {project.supervisor}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">دپارتمان</span>
                <span className="font-bold text-black">
                  {project.department}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">مجریان</span>
                <span className="font-bold text-black flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#b90000] text-white flex items-center justify-center text-[10px]">
                    {project.employerInitial}
                  </span>
                  {project.freelancersText || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">ددلاین پروژه</span>
                <span className="font-bold text-black">{project.deadline}</span>
              </div>
              {project.stage === "active" && (
                <div className="col-span-2">
                  <span className="text-gray-400 block mb-0.5">
                    وضعیت پروژه
                  </span>
                  <span className="bg-[#def7ec] text-[#03543f] px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold inline-block">
                    وضعیت : {project.employerStatus}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 text-right">
              <span className="text-gray-400 text-[12px]">توضیحات پروژه</span>
              <p className="text-[12px] text-gray-800 leading-relaxed font-light">
                {project.description || "توضیحاتی برای این پروژه ثبت نشده است."}
              </p>
            </div>

            {project.isSuperProject && project.stage === "active" && (
              <div className="w-full border-t border-gray-100 pt-3 text-right">
                <div className="flex justify-between items-center text-[12px] text-gray-500 mb-1">
                  <span>مقدار پیشرفت پروژه</span>
                  <span className="font-bold text-blue-600">
                    {project.progress}٪
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3b82f6] rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            )}

            {project.isSuperProject ? (
              <div className="w-full border-t border-gray-100 pt-4 text-right">
                <h4 className="text-[14px] font-bold text-black mb-2">
                  لیست پروژه ها
                </h4>
                <div className="w-full flex flex-col gap-2">
                  {project.subProjects && project.subProjects.length > 0 ? (
                    project.subProjects.map((subProject) => (
                      <div
                        key={subProject.id}
                        className="w-full bg-[#ebebeb] rounded-[5px] p-2.5 flex justify-between items-center px-4 text-[12px]"
                      >
                        <span className="font-bold text-black">
                          {subProject.title}
                        </span>
                        <span className="text-gray-600">
                          {subProject.status}
                        </span>
                        <button
                          onClick={() =>
                            getProjectById(subProject.id).then((p) => {
                              if (onUpdated) onUpdated(p);
                            })
                          }
                          className="h-[26px] px-3 bg-white border border-black rounded-[4px] shadow-[0_2px_0_0_#000000] text-[11px] font-bold text-black active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-0.5"
                        >
                          جزئیات پروژه <BiChevronLeft className="text-base" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-3 text-[12px]">
                      زیرپروژه‌ای برای این ابرپروژه ثبت نشده است.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full border-t border-gray-100 pt-4 text-right">
                <h4 className="text-[14px] font-bold text-black mb-2">
                  لیست پرداختی ها
                </h4>
                <div className="w-full flex flex-col gap-2">
                  {project.payments && project.payments.length > 0 ? (
                    project.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="w-full bg-[#ebebeb] rounded-[5px] p-2.5 flex justify-between items-center px-4 text-[12px]"
                      >
                        <span className="font-medium text-black">
                          {payment.title}
                        </span>
                        <span className="font-bold text-black">
                          {formatPrice(payment.amount)} تومان
                        </span>
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="h-[26px] px-3 bg-white border border-black rounded-[4px] shadow-[0_2px_0_0_#000000] text-[11px] font-bold text-black active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-1"
                        >
                          <BiReceipt /> مشاهده فاکتور
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-3 text-[12px]">
                      پرداختی‌ای برای این پروژه ثبت نشده است.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-[1px] bg-gray-200 self-stretch" />

          <div className="w-[230px] shrink-0 flex flex-col gap-4">
            <div className="w-full bg-[#ebebeb] rounded-[5px] p-3 text-right text-[12px]">
              <span className="text-gray-500 block">مبلغ کل پروژه</span>
              <span className="text-[18px] font-bold text-black">
                {formatPrice(project.budget)}{" "}
                <span className="text-[11px] font-normal">تومان</span>
              </span>
              <div className="text-[10px] text-gray-500 border-t border-gray-300 mt-1.5 pt-1">
                مبلغ پرداخت شده: {formatPrice(project.paidAmount)} تومان
              </div>
            </div>

            {!project.isSuperProject && (
              <button
                onClick={() => openChat(project.ticketId || project.id, project.title)}
                className="w-full h-[36px] border border-black bg-white text-black text-[13px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BiMessageSquareDetail className="text-base" /> تیکت پروژه
              </button>
            )}

            {project.stage === "active" && !project.isSuperProject && (
              <>
                <div className="w-full border border-black bg-white rounded-[5px] p-3 text-right flex flex-col gap-3 relative shadow-[0_2.5px_0_0_#000000]">
                  <span className="text-[12px] font-bold text-black block border-b border-gray-100 pb-1.5">
                    پرداخت هزینه
                  </span>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">
                      عنوان پرداخت :
                    </label>
                    <input
                      type="text"
                      value={payTitle}
                      onChange={(e) => setPayTitle(e.target.value)}
                      className="w-full h-[32px] border border-black rounded-[4px] px-2 text-[11px] bg-gray-50 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">مبلغ :</label>
                    <input
                      type="text"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full h-[32px] border border-black rounded-[4px] px-2 text-[11px] bg-gray-50 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitPayment}
                    disabled={!payTitle.trim() || !payAmount.trim()}
                    className={`w-full h-[32px] bg-[#238250] text-white border border-black text-[12px] font-bold rounded-[4px] shadow-[0_2px_0_0_#000000] active:translate-y-[1.5px] transition-all ${payTitle.trim() && payAmount.trim() ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                  >
                    پرداخت
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTerminateOpen(true)}
                  className="w-full h-[36px] bg-[#fecaca] text-[#dc2626] border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
                >
                  اعلام مختومیت پروژه
                </button>
              </>
            )}

            {project.stage === "completed" && (
              <>
                <form
                  onSubmit={handleAddReview}
                  className="w-full flex flex-col gap-2 border-t border-dashed border-gray-300 pt-3"
                >
                  <div className="flex justify-center gap-1 text-xl text-gray-300 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} onClick={() => setRating(star)}>
                        {star <= rating ? (
                          <FaStar className="text-amber-400" />
                        ) : (
                          <BiStar className="text-gray-300" />
                        )}
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="متن نظر خود را بنویسید..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full h-[36px] border border-black rounded-[5px] px-2.5 text-[11px] text-black bg-white focus:outline-none placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="w-full h-[32px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[11px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1.5px] transition-all cursor-pointer"
                  >
                    ثبت نظر
                  </button>
                </form>

                <div className="w-full flex flex-col gap-3 max-h-[160px] overflow-y-auto scrollbar-none">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="w-full border border-black rounded-[5px] p-2 text-right flex flex-col gap-1 bg-white shadow-[0_1.5px_0_0_#000000]"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] text-gray-400">
                          نظر {rev.role === "employer" ? "کارفرما" : "ناظر"}
                        </span>
                        <div className="flex gap-0.5 text-amber-400 text-[10px]">
                          {[...Array(5)].map((_, i) =>
                            i < rev.stars ? (
                              <FaStar key={i} />
                            ) : (
                              <BiStar key={i} className="text-gray-300" />
                            ),
                          )}
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-700 leading-relaxed mt-1">
                        {rev.text}
                      </p>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center text-gray-400 text-[10px] py-2">
                      هنوز نظری ثبت نشده است.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <TerminateProjectModal
        isOpen={isTerminateOpen}
        onClose={() => setIsTerminateOpen(false)}
        projectId={project.id}
        role="employer"
        onConfirm={() => {
          setIsTerminateOpen(false);
          onClose();
        }}
      />
    </div>
  );
};

export default EmployerProjectDetailsModal;
