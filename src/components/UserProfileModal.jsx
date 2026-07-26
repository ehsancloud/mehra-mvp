import React, { useState, useEffect } from "react";
import { BiX, BiExport, BiPlus, BiChevronDown } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { getDepartments, getUserProfile, updateUser } from "../data/api";
import { LEVEL_LABELS, getLevelLabel } from "../utils/projectLevels";

const formatPrice = (price) => {
  return price ? price.toLocaleString("fa-IR").replace(/٬/g, ",") : "۰";
};

const ALL_ROLES = ["فریلنسر", "کارفرما", "ناظر", "عادی"];
const FREELANCER_LEVELS = Object.values(LEVEL_LABELS);
const levelLabelToCode = (label) =>
  Object.keys(LEVEL_LABELS).find((code) => LEVEL_LABELS[code] === label) || "c";

const UserProfileModal = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [profile, setProfile] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [level, setLevel] = useState(LEVEL_LABELS.c);
  const [income, setIncome] = useState(0);
  const [skills, setSkills] = useState([]);
  const [roles, setRoles] = useState([]);

  const [showLevelDrop, setShowLevelDrop] = useState(false);
  const [showDeptDrop, setShowDeptDrop] = useState(false);
  const [showRoleDrop, setShowRoleDrop] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isFreelancer = user?.role === "freelancer" || roles.includes("فریلنسر");

  useEffect(() => {
    if (!isOpen) return;
    getDepartments().then((list) => setDepartments(list.map((d) => d.name)));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !user) return;
    getUserProfile(user.id).then((fullProfile) => {
      const p = fullProfile || user;
      setProfile(p);
      setFirstName(p.firstName || "");
      setLastName(p.lastName || "");
      setUsername(p.username || "");
      setUniqueId(p.uniqueId || "");
      setEmail(p.email || "");
      setPhone(p.phone || "");
      setLevel(p.level ? getLevelLabel(p.level) : LEVEL_LABELS.c);
      setIncome(p.income || 0);
      setSkills(p.skills || []);
      setRoles(p.roles || []);
    });
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddDepartment = (dept) => {
    if (!skills.includes(dept)) {
      setSkills([...skills, dept]);
    }
    setShowDeptDrop(false);
  };

  const handleRemoveRole = (roleToRemove) => {
    setRoles(roles.filter((r) => r !== roleToRemove));
  };

  const handleAddRole = (role) => {
    if (!roles.includes(role)) {
      setRoles([...roles, role]);
    }
    setShowRoleDrop(false);
  };

  const handleNavigateToProject = (projectId) => {
    onClose();
    navigate(`/supervisor-projects?id=${projectId}`);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const result = await updateUser(user.id, {
      firstName,
      lastName,
      username,
      email,
      phone,
      roles,
      ...(isFreelancer
        ? {
            level: levelLabelToCode(level),
            skills,
          }
        : {}),
    });
    setIsSaving(false);

    if (!result.ok) {
      alert(result.message || "ثبت تغییرات با خطا مواجه شد.");
      return;
    }

    alert(`تغییرات کاربر ${firstName} ${lastName} ثبت شد.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="w-[520px] bg-white border border-black rounded-[8px] p-6 relative z-10 flex flex-col gap-4 max-h-[92vh] overflow-y-auto scrollbar-none select-none shadow-[0_8px_0_0_#000000]"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <div className="w-full flex justify-between items-center border-b border-gray-200 pb-3">
          <div className="w-10 h-10 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[18px]">
            {user.initial || "?"}
          </div>
          <h3 className="text-[20px] font-bold text-black">اطلاعات کاربر</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl cursor-pointer"
          >
            <BiX />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-right">
          <h4 className="text-[14px] font-bold text-black">اطلاعات شخصی</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 font-medium">
                نام
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-[38px] border border-black rounded-[5px] px-3 text-[12px] text-black bg-white focus:outline-none text-right font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 font-medium">
                نام خانوادگی
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-[38px] border border-black rounded-[5px] px-3 text-[12px] text-black bg-white focus:outline-none text-right font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 font-medium">
                نام کاربری
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-[38px] border border-black rounded-[5px] px-3 text-[12px] text-black bg-white focus:outline-none text-center font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 font-medium">
                یونیک اید
              </label>
              <input
                type="text"
                value={uniqueId}
                disabled
                className="w-full h-[38px] border border-black rounded-[5px] px-3 text-[12px] text-black bg-[#e5e7eb] text-center font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 font-medium">
                ایمیل
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[38px] border border-black rounded-[5px] px-3 text-[12px] text-black bg-white focus:outline-none text-center font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 font-medium">
                شماره همراه
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-[38px] border border-black rounded-[5px] px-3 text-[12px] text-black bg-white focus:outline-none text-center font-mono"
              />
            </div>
          </div>
        </div>

        {isFreelancer && (
          <div className="flex flex-col gap-3 text-right">
            <h4 className="text-[14px] font-bold text-black">جزییات پروفایل</h4>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-500 font-medium">
                  مجموع درآمد
                </label>
                <input
                  type="text"
                  value={`${formatPrice(income)} تومان`}
                  disabled
                  className="w-full h-[38px] border border-black rounded-[5px] px-3 text-[12px] text-black bg-[#e5e7eb] text-center font-bold"
                />
              </div>

              <div className="flex flex-col gap-1 relative">
                <label className="text-[11px] text-gray-500 font-medium">
                  سطح
                </label>
                <div
                  onClick={() => setShowLevelDrop(!showLevelDrop)}
                  className="w-full h-[38px] border border-black rounded-[5px] px-3 flex items-center justify-between text-[12px] bg-white cursor-pointer font-bold"
                >
                  <span className="text-black">{level}</span>
                  <BiChevronDown className="text-xl text-black shrink-0" />
                </div>

                {showLevelDrop && (
                  <div className="absolute top-[62px] right-0 left-0 bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30">
                    {FREELANCER_LEVELS.map((lvl) => (
                      <div
                        key={lvl}
                        onClick={() => {
                          setLevel(lvl);
                          setShowLevelDrop(false);
                        }}
                        className="px-3 py-1.5 text-[12px] hover:bg-gray-100 rounded cursor-pointer text-right font-bold text-black"
                      >
                        {lvl}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-1 relative">
              <label className="text-[11px] text-gray-500 font-medium">
                دپارتمان
              </label>
              <div className="w-full border border-black rounded-[5px] p-2.5 bg-white flex flex-col gap-2 min-h-[60px]">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#dbeaff] text-[#1e40af] border border-blue-300 rounded-[4px] px-2.5 py-0.5 text-[11px] font-bold flex items-center gap-1.5"
                    >
                      {skill}
                      <BiX
                        onClick={() => handleRemoveSkill(skill)}
                        className="cursor-pointer text-sm hover:text-red-600"
                      />
                    </span>
                  ))}
                </div>

                <div className="relative mt-auto">
                  <button
                    type="button"
                    onClick={() => setShowDeptDrop(!showDeptDrop)}
                    className="text-[11px] text-gray-400 hover:text-black flex items-center justify-end gap-1 font-medium cursor-pointer mr-auto"
                  >
                    افزودن مهارت <BiPlus />
                  </button>

                  {showDeptDrop && (
                    <div className="absolute bottom-[25px] left-0 w-[200px] bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30 max-h-[140px] overflow-y-auto">
                      {departments.map((dept) => (
                        <div
                          key={dept}
                          onClick={() => handleAddDepartment(dept)}
                          className="px-3 py-1.5 text-[11px] hover:bg-gray-100 rounded cursor-pointer text-right font-medium text-black"
                        >
                          {dept}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 text-right">
          <h4 className="text-[14px] font-bold text-black">لیست پروژه ها</h4>
          <div className="w-full border border-black rounded-[5px] p-2.5 bg-white flex flex-col gap-2">
            {(profile?.projects || []).map((proj) => (
              <div
                key={proj.id}
                className={`w-full h-[36px] rounded-[5px] px-3 flex justify-between items-center border border-gray-300
                  ${proj.isHighlighted ? "bg-[#dbeaff] border-blue-300" : "bg-[#e5e7eb]"}
                `}
              >
                <span className="text-[12px] font-bold text-black">
                  {proj.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigateToProject(proj.id)}
                  className="text-gray-700 hover:text-black text-base cursor-pointer p-1 shrink-0"
                >
                  <BiExport />
                </button>
              </div>
            ))}
            {profile && profile.projects?.length === 0 && (
              <div className="text-center text-gray-400 text-[11px] py-2">
                پروژه‌ای برای این کاربر ثبت نشده است.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 text-right relative">
          <h4 className="text-[14px] font-bold text-black">نقش کاربر</h4>
          <div className="w-full border border-black rounded-[5px] p-2.5 bg-white flex flex-col gap-2 min-h-[60px]">
            <div className="flex flex-wrap gap-2">
              {roles.map((r, index) => (
                <span
                  key={index}
                  className="bg-[#dbeaff] text-[#1e40af] border border-blue-300 rounded-[4px] px-2.5 py-0.5 text-[11px] font-bold flex items-center gap-1.5"
                >
                  {r}
                  <BiX
                    onClick={() => handleRemoveRole(r)}
                    className="cursor-pointer text-sm hover:text-red-600"
                  />
                </span>
              ))}
            </div>

            <div className="relative mt-auto">
              <button
                type="button"
                onClick={() => setShowRoleDrop(!showRoleDrop)}
                className="text-[11px] text-gray-400 hover:text-black flex items-center justify-end gap-1 font-medium cursor-pointer mr-auto"
              >
                افزودن نقش <BiPlus />
              </button>

              {showRoleDrop && (
                <div className="absolute bottom-[25px] left-0 w-[200px] bg-white border border-black rounded-[5px] shadow-[0_3px_0_0_#000000] flex flex-col p-1 z-30">
                  {ALL_ROLES.map((r) => (
                    <div
                      key={r}
                      onClick={() => handleAddRole(r)}
                      className="px-3 py-1.5 text-[11px] hover:bg-gray-100 rounded cursor-pointer text-right font-medium text-black"
                    >
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end mt-2">
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-[180px] h-[38px] bg-white border border-black text-black text-[12px] font-bold rounded-[5px] shadow-[0_3px_0_0_#000000] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer text-center disabled:opacity-60"
          >
            {isSaving ? "در حال ثبت..." : "تایید و اعمال تغییرات"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
