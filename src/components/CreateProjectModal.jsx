import React, { useEffect, useState } from "react";
import { BiChevronDown, BiCloudUpload, BiX, BiPlus, BiTrash } from "react-icons/bi";
import { getDepartments, getPriorities, getTickets, createProject, uploadFile } from "../data/api";
import { LEVEL_LABELS } from "../utils/projectLevels";

const emptySubProject = () => ({
  key: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: "",
  cost: "",
  proposalBudget: "",
  deadline: "",
  level: "c",
  editCount: 1,
});

const CreateProjectModal = ({ isOpen, onClose, onCreated }) => {
  const [departments, setDepartments] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [proposalBudget, setProposalBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState("تعیین نشده");
  const [department, setDepartment] = useState("تعیین نشده");
  const [ticket, setTicket] = useState("بدون تیکت مرتبط");

  const [showPriorityDrop, setShowPriorityDrop] = useState(false);
  const [showDeptDrop, setShowDeptDrop] = useState(false);
  const [showTicketDrop, setShowTicketDrop] = useState(false);
  const [showLevelDrop, setShowLevelDrop] = useState(false);

  const [level, setLevel] = useState("c");
  const [editCount, setEditCount] = useState(1);

  const [briefFile, setBriefFile] = useState(null);

  // Super-project support: when enabled, the single cost/deadline pair is
  // replaced by a repeatable list of sub-projects. Each sub-project is
  // created as its own regular project and follows the exact same
  // lifecycle (assignment, ticket, payments, termination) afterwards.
  const [isSuperProject, setIsSuperProject] = useState(false);
  const [subProjects, setSubProjects] = useState([emptySubProject()]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getDepartments().then((list) => setDepartments(list.map((d) => d.name)));
    getPriorities().then(setPriorities);
    getTickets({ stage: "current" }).then((list) =>
      setTickets(list.filter((t) => !t.relatedProjectId)),
    );
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle("");
    setCost("");
    setProposalBudget("");
    setDeadline("");
    setDescription("");
    setPriority("تعیین نشده");
    setDepartment("تعیین نشده");
    setTicket("بدون تیکت مرتبط");
    setBriefFile(null);
    setLevel("c");
    setEditCount(1);
    setIsSuperProject(false);
    setSubProjects([emptySubProject()]);
  };

  const handleSubProjectChange = (key, field, value) => {
    setSubProjects((prev) =>
      prev.map((sp) => (sp.key === key ? { ...sp, [field]: value } : sp)),
    );
  };

  const handleAddSubProject = () => {
    setSubProjects((prev) => [...prev, emptySubProject()]);
  };

  const handleRemoveSubProject = (key) => {
    setSubProjects((prev) =>
      prev.length > 1 ? prev.filter((sp) => sp.key !== key) : prev,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let briefFileUrl = null;
    if (briefFile) {
      const uploadResult = await uploadFile(briefFile);
      if (!uploadResult.ok) {
        alert("آپلود فایل با خطا مواجه شد.");
        setIsSubmitting(false);
        return;
      }
      briefFileUrl = uploadResult.url;
    }

    const payload = {
      title,
      description,
      priority,
      department,
      deadline,
      budget: Number(cost) || 0,
      proposalBudget: Number(proposalBudget) || Number(cost) || 0,
      ticketId: tickets.find((t) => `تیکت ${t.id}` === ticket)?.id || null,
      briefFileUrl,
      level,
      editCount: Number(editCount) || 1,
      isSuperProject,
      subProjects: isSuperProject
        ? subProjects.filter((sp) => sp.title.trim()).map(sp => ({
            ...sp, 
            budget: Number(sp.cost) || 0,
            proposalBudget: Number(sp.proposalBudget) || Number(sp.cost) || Number(proposalBudget) || 0,
            level: sp.level || level || "c",
            editCount: Number(sp.editCount) || Number(editCount) || 1
          })) 
        : undefined,
    };

    const result = await createProject(payload);
    setIsSubmitting(false);

    if (!result.ok) {
      alert(result.message || "ثبت پروژه با خطا مواجه شد.");
      return;
    }

    alert(`پروژه جدید با عنوان "${title}" با موفقیت ثبت شد.`);
    if (onCreated) onCreated(result.project);
    resetForm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[95] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="w-[720px] bg-white border border-black rounded-[8px] p-6 relative z-10 flex flex-col gap-6 max-h-[92vh] overflow-y-auto scrollbar-none select-none shadow-[0_8px_0_0_#000000]"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-[20px] font-bold text-black">ثبت پروژه جدید</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl cursor-pointer"
          >
            <BiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Super-project toggle */}
          <div
            className="flex items-center justify-between w-full border border-black rounded-[5px] px-4 h-[44px] bg-white cursor-pointer"
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
            <span className="text-[13px] font-bold text-black">
              این پروژه ابرپروژه است (شامل چند زیرپروژه مستقل)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 items-start">
            {/* Right column */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                  موضوع
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
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
                    {["بدون تیکت مرتبط", ...tickets.map((t) => `تیکت ${t.id}`)].map(
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

            {/* Left column */}
            <div className="flex flex-col gap-4">
              {!isSuperProject && (
                <>
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
                      بودجه پیشنهادی کارفرما (تومان)
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً 5000000"
                      value={proposalBudget}
                      onChange={(e) => setProposalBudget(e.target.value)}
                      className="w-full h-[42px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white font-mono"
                    />
                  </div>

                  <div className="relative w-full">
                    <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                      زمان تحویل
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً 1405/05/15"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full h-[42px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative w-full">
                      <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                        سطح
                      </label>
                      <div
                        onClick={() => {
                          setShowLevelDrop(!showLevelDrop);
                          setShowPriorityDrop(false);
                          setShowDeptDrop(false);
                          setShowTicketDrop(false);
                        }}
                        className="w-full h-[40px] border border-black rounded-[5px] px-3 flex items-center justify-between text-[12px] bg-white cursor-pointer"
                      >
                        <BiChevronDown className="text-xl" />
                        <span className="font-bold text-black">{LEVEL_LABELS[level] || LEVEL_LABELS.c}</span>
                      </div>

                      {showLevelDrop && (
                        <div className="absolute top-[44px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30">
                          {Object.keys(LEVEL_LABELS).map((code) => (
                            <div
                              key={code}
                              onClick={() => {
                                setLevel(code);
                                setShowLevelDrop(false);
                              }}
                              className="px-3 py-1.5 text-[11px] hover:bg-gray-100 rounded cursor-pointer text-right font-medium text-black"
                            >
                              {LEVEL_LABELS[code]}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative w-full">
                      <label className="absolute -top-[10px] right-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
                        تعداد ویرایش
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editCount}
                        onChange={(e) => setEditCount(e.target.value)}
                        className="w-full h-[40px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <label className="w-full h-[180px] border-2 border-dashed border-black rounded-[8px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all p-4">
                <BiCloudUpload className="text-6xl text-black" />
                <span className="text-[13px] font-bold text-black">
                  {briefFile ? briefFile.name : "آپلود فایل بریف"}
                </span>
                <input
                  type="file"
                  onChange={(e) => setBriefFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Sub-project rows, shown only when this is a super-project */}
          {isSuperProject && (
            <div className="w-full flex flex-col gap-3 border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[14px] font-bold text-black">
                  زیرپروژه‌های ابرپروژه
                </h4>
                <button
                  type="button"
                  onClick={handleAddSubProject}
                  className="h-[30px] px-3 bg-white border border-black rounded-[4px] text-[11px] font-bold shadow-[0_2px_0_0_#000000] active:translate-y-[1px] cursor-pointer flex items-center gap-1"
                >
                  <BiPlus /> افزودن زیرپروژه
                </button>
              </div>

              {subProjects.map((sp, index) => (
                <div
                  key={sp.key}
                  className="w-full flex flex-col gap-2 border border-gray-200 p-2 rounded-[5px] bg-gray-50"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`عنوان زیرپروژه ${index + 1}`}
                      value={sp.title}
                      onChange={(e) =>
                        handleSubProjectChange(sp.key, "title", e.target.value)
                      }
                      className="flex-1 h-[38px] border border-black rounded-[5px] px-3 text-[12px] text-black focus:outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubProject(sp.key)}
                      className="h-[38px] w-[36px] flex items-center justify-center border border-black rounded-[5px] text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                    >
                      <BiTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <input
                      type="text"
                      placeholder="هزینه"
                      value={sp.cost}
                      onChange={(e) =>
                        handleSubProjectChange(sp.key, "cost", e.target.value)
                      }
                      className="h-[38px] border border-black rounded-[5px] px-2 text-[12px] text-black focus:outline-none bg-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder="بودجه پیشنهادی"
                      value={sp.proposalBudget || ""}
                      onChange={(e) =>
                        handleSubProjectChange(sp.key, "proposalBudget", e.target.value)
                      }
                      className="h-[38px] border border-black rounded-[5px] px-2 text-[12px] text-black focus:outline-none bg-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder="ددلاین"
                      value={sp.deadline}
                      onChange={(e) =>
                        handleSubProjectChange(sp.key, "deadline", e.target.value)
                      }
                      className="h-[38px] border border-black rounded-[5px] px-2 text-[12px] text-black focus:outline-none bg-white"
                    />
                    <select
                      value={sp.level}
                      onChange={(e) => handleSubProjectChange(sp.key, "level", e.target.value)}
                      className="h-[38px] border border-black rounded-[5px] px-2 text-[12px] text-black focus:outline-none bg-white font-bold cursor-pointer"
                    >
                      {Object.keys(LEVEL_LABELS).map(code => (
                        <option key={code} value={code}>{LEVEL_LABELS[code]}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="تعداد ویرایش"
                      value={sp.editCount}
                      onChange={(e) =>
                        handleSubProjectChange(sp.key, "editCount", e.target.value)
                      }
                      className="h-[38px] border border-black rounded-[5px] px-2 text-[12px] text-black focus:outline-none bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-4 w-full mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-[180px] h-[40px] bg-[#1c1c1e] text-white border border-black rounded-[5px] text-[13px] font-bold shadow-[0_3px_0_0_#000000] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? "در حال ثبت..." : "ثبت پروژه"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-[180px] h-[40px] bg-white text-black border border-black rounded-[5px] text-[13px] font-bold shadow-[0_3px_0_0_#000000] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer"
            >
              لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
