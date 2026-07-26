import React, { useState } from "react";
import { BiX } from "react-icons/bi";
import ActiveProjectDetailsModal from "./ActiveProjectDetailsModal";
import { getProjectById } from "../data/api";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

const SuperProjectDetailsModal = ({ isOpen, onClose, superProjectData }) => {
  const [selectedSubProject, setSelectedSubProject] = useState(null);
  const [isSubProjectModalOpen, setIsSubProjectModalOpen] = useState(false);

  if (!isOpen || !superProjectData) return null;

  // Each sub-project is a fully independent project record (its own
  // freelancers/budget/payments/reviews) - it follows the exact same
  // lifecycle as a regular project, so we fetch it for real instead of
  // reusing fields from the parent super-project.
  const handleOpenSubProject = async (subProj) => {
    const fullSubProject = await getProjectById(subProj.id);
    setSelectedSubProject(fullSubProject);
    setIsSubProjectModalOpen(true);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-fadeIn ${
          isSubProjectModalOpen ? "hidden" : "flex"
        }`}
        dir="rtl"
      >
        <div className="absolute inset-0" onClick={onClose} />

        <div
          className="w-[820px] bg-white border-2 border-[#3b82f6] rounded-[8px] p-6 relative z-10 flex flex-col gap-5 max-h-[92vh] overflow-y-auto scrollbar-none select-none shadow-[0_8px_0_0_#000000]"
          style={{ fontFamily: "Pinar-FD" }}
        >
          <span className="absolute top-0 right-6 bg-[#3b82f6] text-white text-[11px] font-bold px-3 py-1 rounded-b-[4px]">
            ابر پروژه
          </span>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-black text-2xl cursor-pointer"
          >
            <BiX />
          </button>

          <div className="grid grid-cols-12 gap-6 items-start mt-4">
            <div className="col-span-8 flex flex-col gap-4 text-right">
              <div>
                <h2 className="text-[22px] font-bold text-black mb-3 text-right">
                  {superProjectData.title}
                </h2>

                <div className="grid grid-cols-2 gap-y-3 text-[12px] text-gray-700 text-right">
                  <div className="flex items-center gap-2 justify-start">
                    <div className="w-7 h-7 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[11px]">
                      {superProjectData.supervisorInitial}
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-gray-400">
                        ناظر پروژه
                      </span>
                      <span className="font-bold text-black">
                        {superProjectData.supervisor}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-start">
                    <div className="w-7 h-7 rounded-full bg-[#b90000] text-white flex items-center justify-center font-bold text-[11px]">
                      {superProjectData.employerInitial}
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-gray-400">
                        کارفرما
                      </span>
                      <span className="font-bold text-black">
                        {superProjectData.employer}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] text-gray-400">
                      دپارتمان
                    </span>
                    <span className="font-bold text-black">
                      {superProjectData.department}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] text-gray-400">
                      ددلاین پروژه
                    </span>
                    <span className="font-bold text-black">
                      {superProjectData.deadline}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <span className="inline-block bg-[#def7ec] text-[#03543f] text-[11px] font-bold px-3 py-1 rounded-[4px]">
                    وضعیت : {superProjectData.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 text-right">
                <span className="block text-[11px] text-gray-400 mb-1">
                  توضیحات پروژه
                </span>
                <p className="text-[12px] text-gray-800 leading-relaxed text-right">
                  {superProjectData.description}
                </p>
              </div>

              <div className="w-full flex flex-col gap-1.5 text-right border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-bold text-black">
                    {superProjectData.progress || 0}%
                  </span>
                  <span className="text-gray-400">مقدار پیشرفت پروژه</span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
                    style={{ width: `${superProjectData.progress || 0}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                <h4 className="text-[14px] font-bold text-black text-right">
                  لیست پروژه ها
                </h4>
                <div className="flex justify-between text-[11px] text-gray-400 px-2">
                  <span>عنوان پروژه</span>
                  <span>وضعیت</span>
                </div>

                {(superProjectData.subProjects || []).map((sub) => (
                  <div
                    key={sub.id}
                    className="w-full h-[48px] bg-[#ebebeb] rounded-[5px] border border-gray-300 px-3 flex justify-between items-center"
                  >
                    <span className="font-bold text-[13px] text-black">
                      {sub.title}
                    </span>

                    <span className="text-[12px] font-medium text-gray-800">
                      {sub.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenSubProject(sub)}
                      className="h-[32px] px-4 bg-white text-black border border-black rounded-[4px] text-[11px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer"
                    >
                      جزئیات پروژه
                    </button>
                  </div>
                ))}

                {(superProjectData.subProjects || []).length === 0 && (
                  <div className="text-center text-gray-400 text-[11px] py-2">
                    هنوز زیرپروژه‌ای برای این ابرپروژه تعریف نشده است.
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-4 flex flex-col gap-3">
              <div className="w-full bg-[#ebebeb] border border-gray-300 rounded-[5px] p-4 flex flex-col gap-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[11px] text-gray-600">
                    مبلغ کل پروژه
                  </span>
                  <span className="font-bold text-[20px] text-black">
                    {formatPrice(superProjectData.budget)}{" "}
                    <span className="text-[11px] font-normal">تومان</span>
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex flex-col items-center">
                  <span className="text-[11px] text-gray-500">
                    مبلغ پرداخت شده
                  </span>
                  <span className="font-bold text-[14px] text-black">
                    {formatPrice(superProjectData.paidAmount)} تومان
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Each sub-project reuses the normal single-project detail flow */}
      <ActiveProjectDetailsModal
        isOpen={isSubProjectModalOpen}
        onClose={() => setIsSubProjectModalOpen(false)}
        projectData={selectedSubProject}
      />
    </>
  );
};

export default SuperProjectDetailsModal;
