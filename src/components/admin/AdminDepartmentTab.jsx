import React, { useEffect, useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { BiSearch, BiBriefcase, BiCheckShield, BiUser } from "react-icons/bi";
import { getDeptUserDirectory } from "../../data/api";

const CircleNode = ({ data }) => {
  return (
    <div className="relative flex items-center justify-center">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-none !w-2 !h-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-none !w-2 !h-2"
      />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!bg-transparent !border-none !w-2 !h-2"
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="!bg-transparent !border-none !w-2 !h-2"
      />

      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-[16px] border-2 border-white shadow-xl ${data.bgColor}`}
        style={{ fontFamily: "Pinar-FD" }}
      >
        {data.label || "M"}
      </div>
    </div>
  );
};

const nodeTypes = { circleNode: CircleNode };

const initialNodes = [
  {
    id: "node-admin",
    type: "circleNode",
    data: { label: "M", bgColor: "bg-green-600" },
    position: { x: 200, y: 30 },
  },
  {
    id: "node-supervisor",
    type: "circleNode",
    data: { label: "M", bgColor: "bg-blue-600" },
    position: { x: 200, y: 150 },
  },
  {
    id: "node-normal",
    type: "circleNode",
    data: { label: "M", bgColor: "bg-gray-500" },
    position: { x: 200, y: 270 },
  },
  {
    id: "node-free1",
    type: "circleNode",
    data: { label: "M", bgColor: "bg-red-600" },
    position: { x: 450, y: 150 },
  },
  {
    id: "node-free2",
    type: "circleNode",
    data: { label: "M", bgColor: "bg-red-600" },
    position: { x: 450, y: 240 },
  },
];

const initialEdges = [
  {
    id: "e1",
    source: "node-admin",
    target: "node-supervisor",
    style: { stroke: "#71717a", strokeWidth: 1.5, strokeDasharray: "4 4" },
  },
  {
    id: "e2",
    source: "node-supervisor",
    target: "node-normal",
    style: { stroke: "#71717a", strokeWidth: 1.5, strokeDasharray: "4 4" },
  },
  {
    id: "e3",
    source: "node-supervisor",
    target: "node-free1",
    sourceHandle: "right",
    targetHandle: "left",
    style: { stroke: "#71717a", strokeWidth: 1.5, strokeDasharray: "4 4" },
  },
  {
    id: "e4",
    source: "node-supervisor",
    target: "node-free2",
    sourceHandle: "right",
    targetHandle: "left",
    style: { stroke: "#71717a", strokeWidth: 1.5, strokeDasharray: "4 4" },
  },
  {
    id: "e5",
    source: "node-admin",
    target: "node-free1",
    sourceHandle: "right",
    targetHandle: "left",
    style: { stroke: "#71717a", strokeWidth: 1.5, strokeDasharray: "4 4" },
  },
];

const EMPTY_DEPT_USERS = { nazers: [], karfarmas: [], freelancers: [] };

const AdminDepartmentTab = () => {
  const [deptUsers, setDeptUsers] = useState(EMPTY_DEPT_USERS);
  const [activeSubTab, setActiveSubTab] = useState("manage");
  const [selectedDeptView, setSelectedDeptView] = useState("dept1");
  const [deptRoleTab, setDeptRoleTab] = useState("nazers");
  const [selectedDeptUser, setSelectedDeptUser] = useState(null);

  // Live search within the department management list
  const [deptSearchQuery, setDeptSearchQuery] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    getDeptUserDirectory().then((data) => {
      setDeptUsers(data);
      setSelectedDeptUser(data.nazers[0] || null);
    });
  }, []);

  // Live filter of department users based on the small search box
  const filteredDeptUsers = useMemo(() => {
    const list = deptUsers[deptRoleTab] || [];
    const query = deptSearchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query),
    );
  }, [deptUsers, deptRoleTab, deptSearchQuery]);

  return (
    <div className="w-[750px] flex flex-col items-center gap-3 select-none">
      {/* Department sub-tabs */}
      <div
        className="relative h-[42px] bg-[#eef0f2] border border-black rounded-[5px] p-1 flex items-center w-full shrink-0"
        style={{ fontFamily: "Pinar-FD" }}
      >
        <button
          onClick={() => setActiveSubTab("departments")}
          className={`flex-1 h-full rounded-[4px] text-[14px] transition-all cursor-pointer ${
            activeSubTab === "departments"
              ? "bg-white text-black font-bold shadow-sm"
              : "text-[#4a4a4a]"
          }`}
        >
          دپارتمان ها
        </button>
        <button
          onClick={() => setActiveSubTab("manage")}
          className={`flex-1 h-full rounded-[4px] text-[14px] transition-all cursor-pointer ${
            activeSubTab === "manage"
              ? "bg-white text-black font-bold shadow-sm"
              : "text-[#4a4a4a]"
          }`}
        >
          مدیریت دپارتمان ها
        </button>
      </div>

      {/* --- ۱: فلوچارت --- */}
      {activeSubTab === "departments" && (
        <div className="w-full h-[420px] border border-black rounded-[8px] overflow-hidden bg-[#18181b] shadow-[0_4px_0_0_#000000] relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={18}
              size={1.5}
              color="#3f3f46"
            />
            <Controls className="bg-white border border-black rounded shadow-md" />
          </ReactFlow>
        </div>
      )}

      {/* --- ۲: مدیریت دپارتمان‌ها --- */}
      {activeSubTab === "manage" && (
        <div
          className="w-full flex items-start gap-3"
          style={{ fontFamily: "Pinar-FD" }}
        >
          {/* Right side: vertical department picker */}
          <div className="w-[130px] bg-white border border-black rounded-[5px] flex flex-col overflow-hidden shadow-[0_3px_0_0_#000000] shrink-0 text-[11px] font-bold">
            {[
              { id: "overall", label: "نمای کلی" },
              { id: "dept1", label: "دپارتمان ۱" },
              { id: "dept2", label: "دپارتمان ۲" },
              { id: "dept3", label: "دپارتمان ۳" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedDeptView(item.id)}
                className={`h-[36px] border-b border-gray-200 text-right px-3 transition-colors cursor-pointer ${
                  selectedDeptView === item.id
                    ? "bg-blue-50 text-blue-600 border-r-4 border-r-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Left side content */}
          <div className="flex-1 flex flex-col gap-3">
            {selectedDeptView === "overall" ? (
              <div className="w-full flex flex-col gap-3">
                <h3 className="text-[16px] font-bold text-black text-right">
                  نمای کلی
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-black rounded-[5px] p-2.5 shadow-[0_3px_0_0_#000000] flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-black">
                      برترین فریلنسر ها (تعداد پروژه)
                    </span>
                    <div className="flex flex-col gap-1.5 text-[9px]">
                      <div className="flex items-center justify-between">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex justify-center items-center font-bold">
                          M
                        </span>
                        <span className="w-16 pr-1 truncate">محمد فرهانی</span>
                        <div className="flex-1 h-2 bg-blue-100 rounded-full mx-1.5">
                          <div className="h-full bg-blue-500 w-[80%] rounded-full" />
                        </div>
                        <span className="font-bold text-blue-600 text-[10px]">
                          ۲۲
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-black rounded-[5px] p-2.5 shadow-[0_3px_0_0_#000000] flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-black">
                      برترین کارفرما ها (تعداد پروژه)
                    </span>
                    <div className="flex flex-col gap-1.5 text-[9px]">
                      <div className="flex items-center justify-between">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex justify-center items-center font-bold">
                          M
                        </span>
                        <span className="w-16 pr-1 truncate">محمد فرهانی</span>
                        <div className="flex-1 h-2 bg-blue-100 rounded-full mx-1.5">
                          <div className="h-full bg-blue-500 w-[80%] rounded-full" />
                        </div>
                        <span className="font-bold text-blue-600 text-[10px]">
                          ۲۲
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-black rounded-[5px] p-3 shadow-[0_3px_0_0_#000000] flex flex-col gap-2 text-right">
                  <span className="text-[12px] font-bold text-black">
                    مبالغ ثبت شده به تفکیک استان
                  </span>
                  <div className="flex justify-between items-center">
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center text-[10px] gap-2">
                        <span className="w-8">تهران</span>
                        <div className="flex-1 h-2 bg-blue-100 rounded-full">
                          <div className="h-full bg-blue-600 w-[85%] rounded-full" />
                        </div>
                        <span className="font-bold">۵۲,۰۰۰,۰۰۰,۰۰۰</span>
                      </div>
                      <div className="flex items-center text-[10px] gap-2">
                        <span className="w-8">اصفهان</span>
                        <div className="flex-1 h-2 bg-blue-100 rounded-full">
                          <div className="h-full bg-blue-400 w-[60%] rounded-full" />
                        </div>
                        <span className="font-bold">۳۳,۰۰۰,۰۰۰,۰۰۰</span>
                      </div>
                    </div>
                    <div className="w-[100px] h-[65px] bg-gray-200 border border-gray-300 rounded mr-3 flex justify-center items-center text-[9px] text-gray-500">
                      نقشه ایران
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3">
                {/* Department header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-[18px] font-bold text-black">
                    {selectedDeptView === "dept1"
                      ? "دپارتمان ۱"
                      : selectedDeptView === "dept2"
                        ? "دپارتمان ۲"
                        : "دپارتمان ۳"}
                  </h2>
                  <button className="h-[28px] px-3 bg-[#fecaca] text-[#dc2626] border border-black rounded shadow-[0_2px_0_0_#000000] text-[10px] font-bold active:translate-y-[1px] cursor-pointer">
                    حذف دپارتمان
                  </button>
                </div>

                {/* Three small stat cards */}
                {/* TODO(API): these three counts are illustrative placeholders.
                    Replace with a real per-department aggregation endpoint,
                    e.g. GET /departments/{id}/stats -> { supervisors, employers, freelancers }. */}
                <div className="grid grid-cols-3 gap-2.5 w-full">
                  <div className="bg-white border border-black rounded-[5px] p-2 shadow-[0_2.5px_0_0_#000000] flex justify-between items-center">
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 block">
                        ناظرین
                      </span>
                      <span className="text-[18px] font-bold text-black">
                        ۳
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex justify-center items-center text-base">
                      <BiCheckShield />
                    </div>
                  </div>
                  <div className="bg-white border border-black rounded-[5px] p-2 shadow-[0_2.5px_0_0_#000000] flex justify-between items-center">
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 block">
                        کارفرما ها
                      </span>
                      <span className="text-[18px] font-bold text-black">
                        ۸
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex justify-center items-center text-base">
                      <BiBriefcase />
                    </div>
                  </div>
                  <div className="bg-white border border-black rounded-[5px] p-2 shadow-[0_2.5px_0_0_#000000] flex justify-between items-center">
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 block">
                        فریلنسر ها
                      </span>
                      <span className="text-[18px] font-bold text-black">
                        ۶
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex justify-center items-center text-base">
                      <BiUser />
                    </div>
                  </div>
                </div>

                {/* Main lower section: user details (right) + list (left) */}
                <div className="w-full flex gap-3 bg-white border border-black rounded-[6px] p-2.5 shadow-[0_3px_0_0_#000000]">
                  {/* Right column: user detail card */}
                  <div className="w-[280px] border border-gray-300 rounded-[5px] p-2.5 flex flex-col gap-2.5 shrink-0 bg-white">
                    {selectedDeptUser ? (
                      <>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex justify-center items-center font-bold text-[10px] shrink-0">
                              {selectedDeptUser.initial}
                            </div>
                            <span className="font-bold text-[11px] truncate max-w-[110px]">
                              {selectedDeptUser.name}
                            </span>
                          </div>
                          {selectedDeptUser.role === "nazer" && (
                            <button className="bg-[#15803d] text-white px-2 py-0.5 rounded text-[9px] font-bold shadow-sm cursor-pointer hover:bg-green-800 transition-colors shrink-0">
                              افزودن ناظر
                            </button>
                          )}
                        </div>

                        {/* Compact two-column first/last name fields */}
                        <div className="grid grid-cols-2 gap-1.5 text-[9px] text-right">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-gray-400">نام</label>
                            <input
                              disabled
                              value={selectedDeptUser.name.split(" ")[0]}
                              className="w-full h-[26px] border border-gray-300 rounded px-1.5 text-center text-[10px] bg-gray-50 text-black font-medium"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-gray-400">
                              نام خانوادگی
                            </label>
                            <input
                              disabled
                              value={selectedDeptUser.name.split(" ")[1] || ""}
                              className="w-full h-[26px] border border-gray-300 rounded px-1.5 text-center text-[10px] bg-gray-50 text-black font-medium"
                            />
                          </div>
                        </div>

                        {/* Username */}
                        <div className="flex flex-col gap-0.5 text-[9px] text-right">
                          <label className="text-gray-400">نام کاربری</label>
                          <input
                            disabled
                            value={selectedDeptUser.username}
                            className="w-full h-[26px] border border-gray-300 rounded px-1.5 text-center text-[10px] bg-gray-50 font-mono text-black font-medium"
                          />
                        </div>

                        {/* Debt / credit */}
                        {selectedDeptUser.role === "freelancer" && (
                          <div className="flex flex-col gap-0.5 text-[9px] text-right border-t border-gray-100 pt-1.5">
                            <label className="font-bold text-black">
                              مجموع بستانکاری
                            </label>
                            <input
                              disabled
                              value={`${(selectedDeptUser.credit || 0).toLocaleString("fa-IR")} تومان`}
                              className="w-full h-[26px] border border-gray-300 rounded px-1.5 text-center bg-gray-50 font-bold text-[10px] text-black"
                            />
                          </div>
                        )}
                        {selectedDeptUser.role === "karfarma" && (
                          <div className="flex flex-col gap-0.5 text-[9px] text-right border-t border-gray-100 pt-1.5">
                            <label className="font-bold text-black">
                              مجموع بدهکاری
                            </label>
                            <input
                              disabled
                              value={`${(selectedDeptUser.debt || 0).toLocaleString("fa-IR")} تومان`}
                              className="w-full h-[26px] border border-gray-300 rounded px-1.5 text-center bg-gray-50 font-bold text-[10px] text-black"
                            />
                          </div>
                        )}

                        {/* Project list */}
                        <div className="flex flex-col gap-1.5 border-t border-gray-200 pt-2 text-[9px] text-right">
                          <label className="font-bold text-black text-[10px]">
                            {selectedDeptUser.role === "nazer"
                              ? "پروژه‌هایی که زیر دستشه:"
                              : "لیست پروژه‌های فعالش:"}
                          </label>
                          <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto scrollbar-none pl-0.5">
                            {(
                              selectedDeptUser.projects ||
                              selectedDeptUser.activeProjects ||
                              []
                            ).length > 0 ? (
                              (
                                selectedDeptUser.projects ||
                                selectedDeptUser.activeProjects ||
                                []
                              ).map((p, i) => (
                                <div
                                  key={i}
                                  className="bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-[4px] text-[10px] text-right text-gray-800 font-medium leading-tight shrink-0 shadow-none hover:bg-gray-100 transition-colors"
                                >
                                  {p}
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 text-[9px]">
                                پروژه‌ای ثبت نشده است
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400 text-[10px] my-auto">
                        کاربری انتخاب نشده است
                      </div>
                    )}
                  </div>

                  {/* Left column: user list + live search */}
                  <div className="flex-1 flex flex-col gap-2 border border-gray-300 rounded-[5px] p-2 bg-gray-50">
                    <div className="flex justify-between items-center bg-white p-1 rounded border border-gray-300 gap-1">
                      {/* Small live-search input */}
                      <div className="relative flex-1 max-w-[120px]">
                        <input
                          type="text"
                          placeholder="جستجو...."
                          value={deptSearchQuery}
                          onChange={(e) => setDeptSearchQuery(e.target.value)}
                          className="w-full h-6 border border-gray-300 rounded px-1.5 pr-5 text-[9px] bg-gray-50 text-right focus:outline-none"
                        />
                        <BiSearch className="absolute top-[6px] right-1 text-gray-400 text-[10px]" />
                      </div>

                      {/* Role tab buttons */}
                      <div className="flex gap-0.5 text-[9px]">
                        <button
                          onClick={() => {
                            setDeptRoleTab("nazers");
                            setDeptSearchQuery("");
                            setSelectedDeptUser(deptUsers.nazers[0]);
                          }}
                          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                            deptRoleTab === "nazers"
                              ? "bg-gray-200 text-black border border-gray-400"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          <BiCheckShield className="inline ml-0.5 text-[10px]" />
                          ناظر ها
                        </button>
                        <button
                          onClick={() => {
                            setDeptRoleTab("karfarmas");
                            setDeptSearchQuery("");
                            setSelectedDeptUser(deptUsers.karfarmas[0]);
                          }}
                          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                            deptRoleTab === "karfarmas"
                              ? "bg-gray-200 text-black border border-gray-400"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          <BiBriefcase className="inline ml-0.5 text-[10px]" />
                          کارفرما ها
                        </button>
                        <button
                          onClick={() => {
                            setDeptRoleTab("freelancers");
                            setDeptSearchQuery("");
                            setSelectedDeptUser(deptUsers.freelancers[0]);
                          }}
                          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                            deptRoleTab === "freelancers"
                              ? "bg-gray-200 text-black border border-gray-400"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          <BiUser className="inline ml-0.5 text-[10px]" />
                          فریلنسر ها
                        </button>
                      </div>
                    </div>

                    {/* Live-filtered user list */}
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[170px] scrollbar-none">
                      {filteredDeptUsers.length > 0 ? (
                        filteredDeptUsers.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => setSelectedDeptUser(u)}
                            className={`w-full h-[36px] p-1.5 border rounded flex justify-start items-center gap-2 cursor-pointer transition-all ${
                              selectedDeptUser?.id === u.id
                                ? "bg-gray-200 border-gray-400 font-bold"
                                : "bg-white border-transparent hover:bg-gray-100"
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex justify-center items-center text-[9px] font-bold shrink-0">
                              {u.initial}
                            </div>
                            <span className="text-[10px] text-black text-right flex-1 truncate">
                              {u.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 text-[10px] py-4">
                          کاربری یافت نشد.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartmentTab;
