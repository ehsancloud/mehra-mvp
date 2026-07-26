import React, { useEffect, useState } from "react";
import { BiX, BiChevronDown, BiCloudUpload } from "react-icons/bi";
import { getDepartments, getPriorities, getTickets, updateProject } from "../data/api";

const EditProjectModal = ({ isOpen, onBack, projectData }) => {
  const [departments, setDepartments] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("زیاد");
  const [department, setDepartment] = useState("");
  const [ticket, setTicket] = useState("تعیین نشده");

  const [showPriorityDrop, setShowPriorityDrop] = useState(false);
  const [showDeptDrop, setShowDeptDrop] = useState(false);
  const [showTicketDrop, setShowTicketDrop] = useState(false);

  const [briefFile, setBriefFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getDepartments().then((list) => setDepartments(list.map((d) => d.name)));
    getPriorities().then(setPriorities);
    getTickets({ stage: "current" }).then(setTickets);
  }, [isOpen]);

  useEffect(() => {
    if (projectData) {
      setTitle(projectData.title || "");
      setCost(projectData.budget || "");
      setDeadline(projectData.deadline || "");
      setDescription(projectData.description || "");
      setPriority(projectData.priority || "زیاد");
      setDepartment(projectData.department || "");
      setTicket(projectData.ticketId ? `تیکت ${projectData.ticketId}` : "تعیین نشده");
    }
  }, [projectData]);

  if (!isOpen || !projectData) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const result = await updateProject(projectData.id, {
      title,
      cost,
      deadline,
      description,
      priority,
      department,
      ticketId: tickets.find((t) => `تیکت ${t.id}` === ticket)?.id || null,
    });

    setIsSaving(false);
    if (!result.ok) {
      alert(result.message || "ویرایش پروژه با خطا مواجه شد.");
      return;
    }

    alert(`اطلاعات پروژه "${title}" با موفقیت ویرایش شد.`);
    onBack();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onBack} />

      <div
        className="w-[720px] bg-white border border-black rounded-[8px] p-6 relative z-10 flex flex-col gap-6 max-h-[92vh] overflow-y-auto scrollbar-none select-none shadow-[0_8px_0_0_#000000]"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-[20px] font-bold text-black">
            ادیت اطلاعات پروژه
          </h3>
          <button
            type="button"
            onClick={onBack}
            className="text-gray-400 hover:text-black text-2xl cursor-pointer"
          >
            <BiX />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                  موضوع
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-[42px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white"
                />
              </div>

              <div className="relative w-full">
                <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                  توضیحات
                </label>
                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-black rounded-[5px] p-3 text-[12px] text-black focus:outline-none resize-none bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative w-full">
                  <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                    الویّت
                  </label>
                  <div
                    onClick={() => {
                      setShowPriorityDrop(!showPriorityDrop);
                      setShowDeptDrop(false);
                    }}
                    className="w-full h-[40px] border border-black rounded-[5px] px-3 flex items-center justify-between text-[12px] bg-white cursor-pointer"
                  >
                    <BiChevronDown className="text-xl" />
                    <span className="font-bold text-black">{priority}</span>
                  </div>

                  {showPriorityDrop && (
                    <div className="absolute top-[44px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30">
                      {priorities.map((p) => (
                        <div
                          key={p}
                          onClick={() => {
                            setPriority(p);
                            setShowPriorityDrop(false);
                          }}
                          className="px-3 py-1.5 text-[11px] hover:bg-gray-100 rounded cursor-pointer text-right font-medium text-black"
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative w-full">
                  <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                    دپارتمان
                  </label>
                  <div
                    onClick={() => {
                      setShowDeptDrop(!showDeptDrop);
                      setShowPriorityDrop(false);
                    }}
                    className="w-full h-[40px] border border-black rounded-[5px] px-3 flex items-center justify-between text-[12px] bg-white cursor-pointer"
                  >
                    <BiChevronDown className="text-xl" />
                    <span className="font-bold text-black">{department}</span>
                  </div>

                  {showDeptDrop && (
                    <div className="absolute top-[44px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30 max-h-[140px] overflow-y-auto">
                      {departments.map((d) => (
                        <div
                          key={d}
                          onClick={() => {
                            setDepartment(d);
                            setShowDeptDrop(false);
                          }}
                          className="px-3 py-1.5 text-[11px] hover:bg-gray-100 rounded cursor-pointer text-right font-medium text-black"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative w-full">
                <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                  انتخاب تیکت مرتبط
                </label>
                <div
                  onClick={() => {
                    setShowTicketDrop(!showTicketDrop);
                    setShowPriorityDrop(false);
                    setShowDeptDrop(false);
                  }}
                  className="w-full h-[40px] border border-black rounded-[5px] px-3 flex items-center justify-between text-[12px] bg-white cursor-pointer"
                >
                  <BiChevronDown className="text-xl" />
                  <span className="font-bold text-black">{ticket}</span>
                </div>

                {showTicketDrop && (
                  <div className="absolute top-[44px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30 max-h-[140px] overflow-y-auto">
                    {["تعیین نشده", ...tickets.map((t) => `تیکت ${t.id}`)].map(
                      (t) => (
                        <div
                          key={t}
                          onClick={() => {
                            setTicket(t);
                            setShowTicketDrop(false);
                          }}
                          className="px-3 py-1.5 text-[11px] hover:bg-gray-100 rounded cursor-pointer text-right font-medium text-black"
                        >
                          {t}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                  هزینه توافق شده
                </label>
                <input
                  type="text"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full h-[42px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white"
                />
              </div>

              <div className="relative w-full">
                <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                  زمان تحویل
                </label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full h-[42px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white"
                />
              </div>

              <label className="w-full h-[180px] border-2 border-dashed border-black rounded-[8px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all p-4">
                <BiCloudUpload className="text-6xl text-black" />
                <span className="text-[13px] font-bold text-black">
                  {briefFile ? briefFile.name : "آپلود فایل بریف جدید"}
                </span>
                <input
                  type="file"
                  onChange={(e) => setBriefFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-center gap-4 w-full mt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-[180px] h-[40px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[13px] font-bold shadow-[0_3px_0_0_#000000] active:translate-y-[1.5px] cursor-pointer disabled:opacity-60"
            >
              {isSaving ? "در حال ثبت..." : "ثبت تغییرات"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-[180px] h-[40px] bg-white text-black border border-black rounded-[5px] text-[13px] font-bold shadow-[0_3px_0_0_#000000] active:translate-y-[1.5px] cursor-pointer"
            >
              لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
