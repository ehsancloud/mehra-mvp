import React, { useEffect, useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { getDepartments, getPriorities, createTicket } from "../data/api";

const CreateTicketModal = ({ isOpen, onClose, onAddTicket }) => {
  const [departments, setDepartments] = useState([]);
  const [priorities, setPriorities] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("");
  const [showDeptDrop, setShowDeptDrop] = useState(false);
  const [showPriorDrop, setShowPriorDrop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getDepartments().then((list) => setDepartments(list.map((d) => d.name)));
    getPriorities().then(setPriorities);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !department || !priority) {
      alert("لطفاً فیلدهای موضوع، دپارتمان و اولویت را تکمیل کنید.");
      return;
    }

    setIsSubmitting(true);
    const result = await createTicket({ title, description, department, priority });
    setIsSubmitting(false);

    if (!result.ok) {
      alert("ثبت تیکت با خطا مواجه شد.");
      return;
    }

    onAddTicket(result.ticket);

    setTitle("");
    setDescription("");
    setDepartment("");
    setPriority("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="w-[440px] bg-white border border-black rounded-[5px] shadow-[0_6px_0_0_#000000] p-6 relative z-10 flex flex-col gap-5 select-none"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <h3 className="text-[16px] font-bold text-black text-center border-b border-gray-100 pb-3">
          ثبت تیکت جدید
        </h3>

        <div className="relative w-full mt-2">
          <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
            موضوع
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-[42px] border border-black rounded-[5px] px-3 text-[13px] text-black focus:outline-none bg-white"
          />
        </div>

        <div className="relative w-full mt-2">
          <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
            توضیحات
          </label>
          <textarea
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-black rounded-[5px] p-3 text-[13px] text-black focus:outline-none resize-none bg-white"
          />
        </div>

        <div className="w-full flex gap-3 z-20">
          <div className="flex-1 relative">
            <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
              اولویت
            </label>
            <div
              onClick={() => {
                setShowPriorDrop(!showPriorDrop);
                setShowDeptDrop(false);
              }}
              className="w-full h-[42px] border border-black rounded-[5px] px-3 flex items-center justify-between text-[13px] bg-white cursor-pointer"
            >
              <span className={priority ? "text-black" : "text-gray-400"}>
                {priority || "تعیین نشده"}
              </span>
              <BiChevronDown className="text-xl" />
            </div>
            {showPriorDrop && (
              <div className="absolute top-[46px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30">
                {priorities.map((p) => (
                  <div
                    key={p}
                    onClick={() => {
                      setPriority(p);
                      setShowPriorDrop(false);
                    }}
                    className="px-3 py-1.5 text-[12px] hover:bg-gray-50 rounded cursor-pointer text-right font-medium text-black"
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 relative">
            <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
              دپارتمان
            </label>
            <div
              onClick={() => {
                setShowDeptDrop(!showDeptDrop);
                setShowPriorDrop(false);
              }}
              className="w-full h-[42px] border border-black rounded-[5px] px-3 flex items-center justify-between text-[13px] bg-white cursor-pointer"
            >
              <span className={department ? "text-black" : "text-gray-400"}>
                {department || "تعیین نشده"}
              </span>
              <BiChevronDown className="text-xl" />
            </div>
            {showDeptDrop && (
              <div className="absolute top-[46px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30 max-h-[160px] overflow-y-auto">
                {departments.map((d) => (
                  <div
                    key={d}
                    onClick={() => {
                      setDepartment(d);
                      setShowDeptDrop(false);
                    }}
                    className="px-3 py-1.5 text-[12px] hover:bg-gray-50 rounded cursor-pointer text-right font-medium text-black"
                  >
                    {d}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 w-full border-t border-gray-100 pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[38px] border border-black bg-white text-black text-[13px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            لغو
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-[38px] border border-black bg-[#1c1c1e] text-white text-[13px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? "در حال ثبت..." : "ثبت تیکت"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicketModal;
