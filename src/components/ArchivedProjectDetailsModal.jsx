import React from "react";
import { BiX, BiStar } from "react-icons/bi";
import { useTicket } from "../context/TicketContext";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

const StarRating = ({ rating = 0 }) => {
  return (
    <div className="flex gap-0.5 text-yellow-400 text-[14px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <BiStar
          key={star}
          className={star <= rating ? "fill-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
};

const ArchivedProjectDetailsModal = ({
  isOpen,
  onClose,
  projectData,
  onOpenFreelancerProfile,
}) => {
  const { openChat } = useTicket();

  if (!isOpen || !projectData) return null;

  const handleOpenTicket = () => {
    openChat(projectData.ticketId || projectData.id, projectData.title);
  };

  const handleOpenFreelancerChat = (freelancer) => {
    const freelancerTicketId =
      freelancer.ticketId || projectData.ticketId || projectData.id;
    const chatTitle = `${projectData.title} | ${freelancer.firstName} ${freelancer.lastName}`;
    openChat(freelancerTicketId, chatTitle);
  };

  const reviews = projectData.reviews || [];
  const employerReview = reviews.find((r) => r.role === "employer");
  const supervisorReview = reviews.find((r) => r.role === "supervisor");
  const payments = projectData.payments || [];

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="w-[820px] bg-white border border-black rounded-[8px] p-6 relative z-10 flex flex-col gap-5 max-h-[92vh] overflow-y-auto scrollbar-none select-none shadow-[0_8px_0_0_#000000]"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-black text-2xl cursor-pointer"
        >
          <BiX />
        </button>

        <div className="grid grid-cols-12 gap-6 items-start mt-2">
          <div className="col-span-7 flex flex-col gap-4 text-right">
            <div>
              <h2 className="text-[22px] font-bold text-black mb-3 text-right">
                {projectData.title}
              </h2>

              <div className="grid grid-cols-2 gap-y-3 text-[12px] text-gray-700 text-right">
                <div className="flex items-center gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[11px]">
                    {projectData.supervisorInitial}
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-gray-400">
                      ناظر پروژه
                    </span>
                    <span className="font-bold text-black">
                      {projectData.supervisor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-[#b90000] text-white flex items-center justify-center font-bold text-[11px]">
                    {projectData.employerInitial}
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-gray-400">
                      کارفرما
                    </span>
                    <span className="font-bold text-black">
                      {projectData.employer}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] text-gray-400">
                    دپارتمان
                  </span>
                  <span className="font-bold text-black">
                    {projectData.department}
                  </span>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] text-gray-400">
                    فریلنسرها
                  </span>
                  <span className="font-bold text-black">
                    {projectData.freelancersText || "—"}
                  </span>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] text-gray-400">
                    ددلاین پروژه
                  </span>
                  <span className="font-bold text-black">
                    {projectData.deadline}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 text-right">
              <span className="block text-[11px] text-gray-400 mb-1">
                توضیحات پروژه
              </span>
              <p className="text-[12px] text-gray-800 leading-relaxed text-right">
                {projectData.description}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
              <span className="text-[11px] text-gray-400 text-right block">
                فریلنسر ها
              </span>

              {(projectData.freelancersList || []).map((f) => (
                <div
                  key={f.id}
                  className="w-full h-[52px] border border-black rounded-[5px] px-3 flex justify-between items-center bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3 text-[11px]">
                    <div className="w-7 h-7 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[10px]">
                      {f.initial}
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] text-gray-400">نام</span>
                      <span className="font-bold text-black">
                        {f.firstName}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] text-gray-400">
                        نام خانوادگی
                      </span>
                      <span className="font-bold text-black">{f.lastName}</span>
                    </div>
                    <div className="h-6 border-r border-gray-300 mx-1"></div>
                    <div className="flex flex-col text-center">
                      <span className="text-[9px] text-gray-400">سطح</span>
                      <span className="font-bold text-black">{f.level}</span>
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-[9px] text-gray-400">امتیاز</span>
                      <span className="font-bold text-black">{f.score}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleOpenFreelancerChat(f)}
                      className="text-[9px] text-gray-500 hover:text-black hover:underline cursor-pointer transition-all"
                    >
                      هدایت به تیکت
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenFreelancerProfile && onOpenFreelancerProfile(f)
                      }
                      className="h-[26px] px-4 bg-[#1c1c1e] text-white border border-black rounded-[4px] text-[11px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
                    >
                      مشاهده
                    </button>
                  </div>
                </div>
              ))}

              {(projectData.freelancersList || []).length === 0 && (
                <div className="text-center text-gray-400 text-[11px] py-2">
                  فریلنسری برای این پروژه ثبت نشده است.
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3 flex flex-col gap-1.5 text-right">
              <span className="text-[11px] text-gray-400 block">
                مبلغ پرداختی
              </span>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="w-full h-[46px] bg-[#ebebeb] rounded-[5px] border border-gray-300 px-3 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[12px] text-gray-800">
                      {payment.title}
                    </span>
                    <span className="font-bold text-[13px] text-black">
                      {formatPrice(payment.amount)} تومان
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      alert(`جزئیات فاکتور مرحله ${projectData.title}`)
                    }
                    className="h-[30px] px-3 bg-white border border-black rounded-[4px] text-[11px] font-bold text-black shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
                  >
                    جزئیات پرداخت
                  </button>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="text-center text-gray-400 text-[11px] py-2">
                  پرداختی برای این پروژه ثبت نشده است.
                </div>
              )}
            </div>
          </div>

          <div className="col-span-5 flex flex-col gap-4">
            <div className="w-full bg-[#ebebeb] border border-gray-300 rounded-[5px] p-3 flex flex-col justify-center text-center h-[85px]">
              <span className="text-[11px] text-gray-600">مبلغ کل پروژه</span>
              <div className="font-bold text-[20px] text-black mt-1">
                {formatPrice(projectData.budget)}{" "}
                <span className="text-[12px] font-normal">تومان</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenTicket}
              className="w-full h-[38px] bg-white text-black border border-black rounded-[5px] text-[12px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
            >
              تیکت پروژه
            </button>

            <div className="flex flex-col gap-1 text-right">
              <span className="text-[11px] font-bold text-gray-700">
                نظر کارفرما
              </span>
              <div className="w-full border border-black rounded-[5px] p-3 bg-white flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#b90000] text-white flex items-center justify-center font-bold text-[9px]">
                      {employerReview?.initial || projectData.employerInitial}
                    </div>
                    <span className="font-bold text-[11px] text-black">
                      {employerReview?.raterName || projectData.employer}
                    </span>
                  </div>
                  <StarRating rating={employerReview?.stars || 0} />
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed text-right">
                  {employerReview?.text || "هنوز نظری از کارفرما ثبت نشده است."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-right">
              <span className="text-[11px] font-bold text-gray-700">
                نظر ناظر
              </span>
              <div className="w-full border border-black rounded-[5px] p-3 bg-white flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[9px]">
                      {supervisorReview?.initial || projectData.supervisorInitial}
                    </div>
                    <span className="font-bold text-[11px] text-black">
                      {supervisorReview?.raterName || projectData.supervisor}
                    </span>
                  </div>
                  <StarRating rating={supervisorReview?.stars || 0} />
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed text-right">
                  {supervisorReview?.text || "هنوز نظری از ناظر ثبت نشده است."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivedProjectDetailsModal;
