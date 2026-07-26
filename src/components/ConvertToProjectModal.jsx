import React, { useEffect, useState } from "react";
import { BiX, BiPaperclip, BiChevronDown, BiPlus, BiTrash } from "react-icons/bi";
import { getDepartments, getUsers, convertTicketToProject } from "../data/api";

const emptySubProject = () => ({
  key: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: "",
  cost: "",
  deadline: "",
});

const ConvertToProjectModal = ({ isOpen, onClose, ticketTitle, ticketId }) => {
  const [departments, setDepartments] = useState([]);
  const [employers, setEmployers] = useState([]);

  const [title, setTitle] = useState(ticketTitle || "");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [agreeCost, setAgreeCost] = useState("");
  const [defaultFreelancerCost, setDefaultFreelancerCost] = useState("");
  const [employer, setEmployer] = useState("");
  const [deadline, setDeadline] = useState("");
  const [sendToFreelancers, setSendToFreelancers] = useState(true);
  const [briefFile, setBriefFile] = useState(null);

  const [showDeptDrop, setShowDeptDrop] = useState(false);
  const [showEmpDrop, setShowEmpDrop] = useState(false);

  const [isSuperProject, setIsSuperProject] = useState(false);
  const [subProjects, setSubProjects] = useState([emptySubProject()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(ticketTitle || "");
    getDepartments().then((list) => setDepartments(list.map((d) => d.name)));
    getUsers({ role: "employer" }).then((list) =>
      setEmployers(list.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }))),
    );
  }, [isOpen, ticketTitle]);

  if (!isOpen) return null;

  const handleSubProjectChange = (key, field, value) => {
    setSubProjects((prev) =>
      prev.map((sp) => (sp.key === key ? { ...sp, [field]: value } : sp)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const employerRecord = employers.find((e) => e.name === employer);
    const result = await convertTicketToProject({
      title,
      description,
      department,
      cost: agreeCost,
      defaultFreelancerCost,
      employerId: employerRecord?.id,
      deadline,
      sendToFreelancers,
      ticketId,
      isSuperProject,
      subProjects: isSuperProject
        ? subProjects.filter((sp) => sp.title.trim())
        : undefined,
    });

    setIsSubmitting(false);
    if (!result.ok) {
      alert("ایجاد پروژه با خطا مواجه شد.");
      return;
    }

    alert(`پروژه "${title}" با موفقیت ایجاد شد!`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[95] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="w-[520px] bg-white border border-black rounded-[5px] shadow-[0_8px_0_0_#000000] p-6 relative z-10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto scrollbar-none select-none"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="text-[16px] font-bold text-black">تعریف پروژه</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl cursor-pointer"
          >
            <BiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
          <div
            className="flex items-center justify-between w-full border border-black rounded-[5px] px-3 h-[40px] bg-white cursor-pointer"
            onClick={() => setIsSuperProject(!isSuperProject)}
          >
            <button
              type="button"
              className={`w-9 h-5 rounded-full transition-all relative shrink-0 ${
                isSuperProject ? "bg-[#3c78d3]" : "bg-gray-300"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                  isSuperProject ? "right-1" : "right-5"
                }`}
              />
            </button>
            <span className="text-[12px] font-bold text-black">
              این پروژه ابرپروژه است
            </span>
          </div>

          <div className="relative w-full">
            <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
              عنوان پروژه
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full h-[40px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white"
            />
          </div>

          <div className="relative w-full">
            <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
              توضیحات پروژه
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-black rounded-[5px] p-2.5 text-[12px] text-black focus:outline-none resize-none bg-white"
            />
          </div>

          <div className="flex gap-3 w-full">
            <div className="flex-1 relative">
              <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                دپارتمان مربوطه
              </label>
              <div
                onClick={() => {
                  setShowDeptDrop(!showDeptDrop);
                  setShowEmpDrop(false);
                }}
                className="w-full h-[40px] border border-black rounded-[5px] px-3 flex items-center justify-between text-[12px] bg-white cursor-pointer"
              >
                <span className={department ? "text-black font-bold" : "text-gray-400"}>
                  {department || "انتخاب کنید"}
                </span>
                <BiChevronDown className="text-xl" />
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
                      className="px-3 py-1.5 text-[11px] hover:bg-gray-100 rounded cursor-pointer font-medium text-black"
                    >
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                کارفرما
              </label>
              <div
                onClick={() => {
                  setShowEmpDrop(!showEmpDrop);
                  setShowDeptDrop(false);
                }}
                className="w-full h-[40px] border border-black rounded-[5px] px-3 flex items-center justify-between text-[12px] bg-white cursor-pointer"
              >
                <span className={employer ? "text-black font-bold" : "text-gray-400"}>
                  {employer || "انتخاب کارفرما"}
                </span>
                <BiChevronDown className="text-xl" />
              </div>
              {showEmpDrop && (
                <div className="absolute top-[44px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30 max-h-[140px] overflow-y-auto">
                  {employers.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => {
                        setEmployer(e.name);
                        setShowEmpDrop(false);
                      }}
                      className="px-3 py-1.5 text-[11px] hover:bg-gray-100 rounded cursor-pointer font-medium text-black"
                    >
                      {e.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isSuperProject && (
            <div className="flex gap-3 w-full">
              <div className="flex-1 relative">
                <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
                  هزینه توافق شده (تومان)
                </label>
                <input
                  type="text"
                  value={agreeCost}
                  onChange={(e) => setAgreeCost(e.target.value)}
                  className="w-full h-[40px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white font-mono"
                />
              </div>

              <div className="flex-1 relative">
                <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
                  هزینه پیش‌فرض فریلنسر
                </label>
                <input
                  type="text"
                  value={defaultFreelancerCost}
                  onChange={(e) => setDefaultFreelancerCost(e.target.value)}
                  className="w-full h-[40px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white font-mono"
                />
              </div>
            </div>
          )}

          {!isSuperProject && (
            <div className="relative w-full">
              <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
                زمان تحویل (ددلاین)
              </label>
              <input
                type="text"
                placeholder="مثلاً 1405/05/15"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-[40px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white"
              />
            </div>
          )}

          {isSuperProject && (
            <div className="w-full flex flex-col gap-2 border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-black">
                  زیرپروژه‌ها
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSubProjects((prev) => [...prev, emptySubProject()])
                  }
                  className="h-[28px] px-2.5 bg-white border border-black rounded-[4px] text-[10px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer flex items-center gap-1"
                >
                  <BiPlus /> افزودن
                </button>
              </div>
              {subProjects.map((sp, index) => (
                <div
                  key={sp.key}
                  className="w-full grid grid-cols-[1fr_100px_100px_32px] gap-1.5 items-center"
                >
                  <input
                    type="text"
                    placeholder={`زیرپروژه ${index + 1}`}
                    value={sp.title}
                    onChange={(e) =>
                      handleSubProjectChange(sp.key, "title", e.target.value)
                    }
                    className="h-[34px] border border-black rounded-[5px] px-2 text-[11px] text-black focus:outline-none bg-white"
                  />
                  <input
                    type="text"
                    placeholder="هزینه"
                    value={sp.cost}
                    onChange={(e) =>
                      handleSubProjectChange(sp.key, "cost", e.target.value)
                    }
                    className="h-[34px] border border-black rounded-[5px] px-2 text-[11px] text-black focus:outline-none bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="ددلاین"
                    value={sp.deadline}
                    onChange={(e) =>
                      handleSubProjectChange(sp.key, "deadline", e.target.value)
                    }
                    className="h-[34px] border border-black rounded-[5px] px-2 text-[11px] text-black focus:outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSubProjects((prev) =>
                        prev.length > 1
                          ? prev.filter((x) => x.key !== sp.key)
                          : prev,
                      )
                    }
                    className="h-[34px] w-[32px] flex items-center justify-center border border-black rounded-[5px] text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <BiTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative w-full">
            <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium">
              فایل بریف نهایی
            </label>
            <label className="w-full h-[42px] border border-dashed border-black rounded-[5px] px-3 flex items-center justify-between text-[12px] bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all">
              <span className="text-gray-500 truncate">
                {briefFile ? briefFile.name : "انتخاب فایل ورد / پی‌دی‌اف نهایی..."}
              </span>
              <BiPaperclip className="text-xl text-gray-700 shrink-0" />
              <input
                type="file"
                onChange={(e) => setBriefFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div
            className="flex items-center gap-2 mt-1 cursor-pointer"
            onClick={() => setSendToFreelancers(!sendToFreelancers)}
          >
            <input
              type="checkbox"
              checked={sendToFreelancers}
              onChange={() => {}}
              className="w-4 h-4 accent-black cursor-pointer"
            />
            <span className="text-[12px] font-bold text-black">
              ارسال پیام/اعلان به فریلنسرها
            </span>
          </div>

          <div className="flex gap-3 w-full border-t border-gray-100 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[40px] border border-black bg-white text-black text-[13px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              کنسل
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-[40px] border border-black bg-[#1c1c1e] text-white text-[13px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? "در حال ثبت..." : "تأیید و ایجاد پروژه"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertToProjectModal;
