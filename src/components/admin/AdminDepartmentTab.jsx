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
import { BiSearch, BiBriefcase, BiCheckShield, BiUser, BiPlus, BiPencil, BiTrash } from "react-icons/bi";
import { 
  getDeptUserDirectory, 
  getDepartmentsStats, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  getDepartmentUserStats 
} from "../../data/api";

/**
 * تبدیل پاسخ getDepartmentUserStats به نودها و اِج‌های ReactFlow
 * Layout: هر Supervisor در بالا، Freelancers سمت چپ، Employers سمت راست
 */
const buildGraph = (supervisors) => {
  const newNodes = [];
  const newEdges = [];
  const edgeStyle = { stroke: "#71717a", strokeWidth: 1.5, strokeDasharray: "4 4" };
  
  let supervisorY = 40;
  const supervisorSpacing = 300;
  
  supervisors.forEach((sup, sIdx) => {
    if (!sup.supervisor) return;
    
    const supNodeId = `sup-${sup.supervisorId}`;
    const initials = `${sup.supervisor.firstName?.[0] || ""}${sup.supervisor.lastName?.[0] || ""}`;
    
    // نود Supervisor
    newNodes.push({
      id: supNodeId,
      type: "circleNode",
      data: { 
        label: initials || "S", 
        bgColor: "bg-blue-600",
        name: `${sup.supervisor.firstName} ${sup.supervisor.lastName}`
      },
      position: { x: 300, y: supervisorY }
    });
    
    // Freelancers — سمت چپ
    (sup.freelancers || []).forEach((f, fIdx) => {
      const fNodeId = `free-${f.userId}-${sIdx}`;
      const fInitials = `${f.firstName?.[0] || ""}${f.lastName?.[0] || ""}`;
      newNodes.push({
        id: fNodeId,
        type: "circleNode",
        data: { 
          label: fInitials || "F", 
          bgColor: "bg-red-600",
          name: `${f.firstName} ${f.lastName}`
        },
        position: { 
          x: 80 + (fIdx % 3) * 70, 
          y: supervisorY + 100 + Math.floor(fIdx / 3) * 70 
        }
      });
      newEdges.push({
        id: `e-${supNodeId}-${fNodeId}`,
        source: supNodeId,
        target: fNodeId,
        sourceHandle: "left",
        targetHandle: "right",
        style: edgeStyle
      });
    });
    
    // Employers — سمت راست
    (sup.employers || []).forEach((e, eIdx) => {
      const eNodeId = `emp-${e.userId}-${sIdx}`;
      const eInitials = `${e.firstName?.[0] || ""}${e.lastName?.[0] || ""}`;
      newNodes.push({
        id: eNodeId,
        type: "circleNode",
        data: { 
          label: eInitials || "E", 
          bgColor: "bg-green-600",
          name: `${e.firstName} ${e.lastName}`
        },
        position: { 
          x: 520 + (eIdx % 3) * 70, 
          y: supervisorY + 100 + Math.floor(eIdx / 3) * 70 
        }
      });
      newEdges.push({
        id: `e-${supNodeId}-${eNodeId}`,
        source: supNodeId,
        target: eNodeId,
        style: edgeStyle
      });
    });
    
    const maxChildren = Math.max(
      (sup.freelancers || []).length, 
      (sup.employers || []).length,
      1
    );
    supervisorY += supervisorSpacing + Math.ceil(maxChildren / 3) * 70;
  });
  
  return { nodes: newNodes, edges: newEdges };
};

const CircleNode = ({ data }) => {
  return (
    <div className="relative flex flex-col items-center justify-center" title={data.name || ""}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-2 !h-2" />
      <Handle type="target" id="left" position={Position.Left} className="!bg-transparent !border-none !w-2 !h-2" />
      <Handle type="source" id="right" position={Position.Right} className="!bg-transparent !border-none !w-2 !h-2" />
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-[14px] border-2 border-white shadow-xl ${data.bgColor}`} style={{ fontFamily: "Pinar-FD" }}>
        {data.label || "?"}
      </div>
      {data.name && (
        <span className="text-[9px] text-white mt-1 whitespace-nowrap max-w-[80px] truncate text-center">
          {data.name}
        </span>
      )}
    </div>
  );
};

const nodeTypes = { circleNode: CircleNode };

const EMPTY_DEPT_USERS = { supervisors: [], employers: [], freelancers: [] };

const AdminDepartmentTab = () => {
  const [deptUsers, setDeptUsers] = useState(EMPTY_DEPT_USERS);
  const [deptStats, setDeptStats] = useState([]);

  const [activeSubTab, setActiveSubTab] = useState("manage");
  const [selectedDeptView, setSelectedDeptView] = useState("overall"); // ID or 'overall'
  const [deptRoleTab, setDeptRoleTab] = useState("supervisors"); // 'supervisors' | 'employers' | 'freelancers'
  const [selectedDeptUser, setSelectedDeptUser] = useState(null);

  const [deptSearchQuery, setDeptSearchQuery] = useState("");
  
  // استیت‌های دپارتمان جدید و ویرایش دپارتمان
  const [newDeptName, setNewDeptName] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  
  // استیت ذخیره آمار کاربران دپارتمان (برای نمایش لیست دقیق کاربران همون دپارتمان)
  const [deptSpecificUsers, setDeptSpecificUsers] = useState(EMPTY_DEPT_USERS);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // واکشی داده‌های کلی برای نمای کلی (overall)
  const fetchOverallData = () => {
    getDeptUserDirectory().then((data) => {
      setDeptUsers(data || EMPTY_DEPT_USERS);
      if (selectedDeptView === "overall") {
         if (data?.supervisors?.length > 0) setSelectedDeptUser(data.supervisors[0]);
      }
    });
    getDepartmentsStats().then((data) => {
      if (data && data.departments) setDeptStats(data.departments);
    });
  };

  useEffect(() => {
    fetchOverallData();
  }, []);

  // واکشی داده‌های کاربران یک دپارتمان خاص وقتی یک دپارتمان انتخاب می‌شود
  useEffect(() => {
    if (selectedDeptView !== "overall") {
       getDepartmentUserStats(selectedDeptView).then(data => {
           if(data && data.supervisors) {
               // دیتاهای بک‌اند معمولا داخل یک آرایه از supervisor هاست که کارفرماها و فریلنسرها درونشه
               let allSups = [];
               let allEmps = [];
               let allFree = [];
               
               data.supervisors.forEach(s => {
                   if(s.supervisor) allSups.push({...s.supervisor, name: `${s.supervisor.firstName} ${s.supervisor.lastName}`});
                   if(s.employers) s.employers.forEach(e => allEmps.push({...e, name: `${e.firstName} ${e.lastName}`}));
                   if(s.freelancers) s.freelancers.forEach(f => allFree.push({...f, name: `${f.firstName} ${f.lastName}`}));
               });

               const specificUsers = {
                 supervisors: allSups,
                 employers: allEmps,
                 freelancers: allFree
               };
               setDeptSpecificUsers(specificUsers);
               
               // آپدیت گراف
               const { nodes: newNodes, edges: newEdges } = buildGraph(data.supervisors);
               setNodes(newNodes);
               setEdges(newEdges);

               // دیفالت کردن کاربر انتخاب شده به اولین نفر در تب باز
               if(specificUsers[deptRoleTab]?.length > 0) {
                   setSelectedDeptUser(specificUsers[deptRoleTab][0]);
               } else {
                   setSelectedDeptUser(null);
               }
           } else {
               setDeptSpecificUsers(EMPTY_DEPT_USERS);
               setSelectedDeptUser(null);
               setNodes([]);
               setEdges([]);
           }
       });
    } else {
        // اگر نمای کلی انتخاب شده بود، لیست کاربران همان لیست کلی است
        if (deptUsers[deptRoleTab]?.length > 0) {
            setSelectedDeptUser(deptUsers[deptRoleTab][0]);
        }
        setNodes([]);
        setEdges([]);
    }
  }, [selectedDeptView]);


  // ---------------------------------------------------------------------------
  // اکشن‌های دپارتمان
  // ---------------------------------------------------------------------------
  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) return;
    setIsCreatingDept(true);
    const res = await createDepartment({ name: newDeptName.trim() });
    setIsCreatingDept(false);
    if (res.ok) {
      alert("دپارتمان جدید با موفقیت ایجاد شد.");
      setNewDeptName("");
      fetchOverallData(); 
    } else {
      alert(res.message || "خطا در ایجاد دپارتمان.");
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if(!window.confirm("آیا از حذف این دپارتمان اطمینان دارید؟")) return;
    const res = await deleteDepartment(deptId);
    if (res.ok) {
       alert("دپارتمان با موفقیت حذف شد.");
       setSelectedDeptView("overall");
       fetchOverallData();
    } else {
       alert(res.message || "خطا در حذف دپارتمان.");
    }
  };

  const handleEditDepartment = async (deptId, currentName) => {
    const newName = window.prompt("نام جدید دپارتمان را وارد کنید:", currentName);
    if(!newName || newName.trim() === currentName) return;
    
    const res = await updateDepartment(deptId, { name: newName.trim() });
    if(res.ok) {
        alert("دپارتمان با موفقیت ویرایش شد.");
        fetchOverallData();
    } else {
        alert(res.message || "خطا در ویرایش دپارتمان.");
    }
  };


  // تصمیم‌گیری اینکه از لیست کلی استفاده کنیم یا لیست خاص دپارتمان
  const currentUsersList = selectedDeptView === "overall" ? deptUsers : deptSpecificUsers;

  const filteredDeptUsers = useMemo(() => {
    const list = currentUsersList[deptRoleTab] || [];
    const query = deptSearchQuery.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (u) => u.name.toLowerCase().includes(query) || (u.username && u.username.toLowerCase().includes(query))
    );
  }, [currentUsersList, deptRoleTab, deptSearchQuery]);

  const currentDeptStat = useMemo(() => {
    if (selectedDeptView === "overall" || !deptStats.length) return null;
    return deptStats.find((d) => d.department.id === selectedDeptView);
  }, [selectedDeptView, deptStats]);

  return (
    <div className="w-[750px] flex flex-col items-center gap-3 select-none">
      <div className="relative h-[42px] bg-[#eef0f2] border border-black rounded-[5px] p-1 flex items-center w-full shrink-0" style={{ fontFamily: "Pinar-FD" }}>
        <button onClick={() => setActiveSubTab("departments")} className={`flex-1 h-full rounded-[4px] text-[14px] transition-all cursor-pointer ${activeSubTab === "departments" ? "bg-white text-black font-bold shadow-sm" : "text-[#4a4a4a]"}`}>
          دپارتمان ها
        </button>
        <button onClick={() => setActiveSubTab("manage")} className={`flex-1 h-full rounded-[4px] text-[14px] transition-all cursor-pointer ${activeSubTab === "manage" ? "bg-white text-black font-bold shadow-sm" : "text-[#4a4a4a]"}`}>
          مدیریت دپارتمان ها
        </button>
      </div>

      {activeSubTab === "departments" && (
        <>
          <div className="w-full flex items-center justify-start gap-2 px-1">
            <select
              value={selectedDeptView}
              onChange={(e) => setSelectedDeptView(e.target.value)}
              className="h-[36px] border border-black rounded-[5px] px-3 text-[12px] font-bold bg-white outline-none cursor-pointer"
            >
              <option value="overall">گراف دپارتمان (یک دپارتمان را انتخاب کنید)</option>
              {deptStats.map(d => (
                <option key={d.department.id} value={d.department.id}>
                  {d.department.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full h-[420px] border border-black rounded-[8px] overflow-hidden bg-[#18181b] shadow-[0_4px_0_0_#000000] relative">
            {nodes.length > 0 ? (
              <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}>
                <Background variant={BackgroundVariant.Dots} gap={18} size={1.5} color="#3f3f46" />
                <Controls className="bg-white border border-black rounded shadow-md" />
              </ReactFlow>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-[13px] bg-[#18181b]">
                {selectedDeptView === "overall" ? "برای مشاهده چارت، یک دپارتمان انتخاب کنید." : "داده‌ای برای نمایش یافت نشد."}
              </div>
            )}
          </div>
        </>
      )}

      {activeSubTab === "manage" && (
        <div className="w-full flex items-start gap-3" style={{ fontFamily: "Pinar-FD" }}>
          
          <div className="w-[130px] bg-white border border-black rounded-[5px] flex flex-col overflow-hidden shadow-[0_3px_0_0_#000000] shrink-0 text-[11px] font-bold">
            <button onClick={() => setSelectedDeptView("overall")} className={`h-[36px] border-b border-gray-200 text-right px-3 transition-colors cursor-pointer ${selectedDeptView === "overall" ? "bg-blue-50 text-blue-600 border-r-4 border-r-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
              نمای کلی
            </button>
            {deptStats.map((item) => (
              <button key={item.department.id} onClick={() => setSelectedDeptView(item.department.id)} className={`h-[36px] border-b border-gray-200 text-right px-3 transition-colors cursor-pointer ${selectedDeptView === item.department.id ? "bg-blue-50 text-blue-600 border-r-4 border-r-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
                {item.department.name}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {/* باکس ایجاد دپارتمان */}
            <div className="w-full bg-white border border-black rounded-[5px] p-2.5 flex items-center gap-3 shadow-[0_3px_0_0_#000000]">
              <span className="text-[12px] font-bold text-black whitespace-nowrap">ایجاد دپارتمان جدید:</span>
              <input 
                type="text" 
                value={newDeptName} 
                onChange={(e) => setNewDeptName(e.target.value)} 
                placeholder="نام دپارتمان را وارد کنید..." 
                className="flex-1 h-8 border border-gray-300 rounded px-2 text-[11px] focus:border-black focus:outline-none bg-gray-50" 
              />
              <button 
                onClick={handleCreateDepartment} 
                disabled={isCreatingDept || !newDeptName.trim()} 
                className="h-8 px-4 bg-[#1c1c1e] text-white text-[11px] font-bold rounded shadow-[0_2px_0_0_#000000] active:translate-y-[1px] disabled:opacity-50 cursor-pointer flex items-center gap-1"
              >
                <BiPlus /> ثبت
              </button>
            </div>

            {selectedDeptView === "overall" ? (
              <div className="w-full flex flex-col gap-3">
                <h3 className="text-[16px] font-bold text-black text-right">نمای کلی</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-black rounded-[5px] p-2.5 shadow-[0_3px_0_0_#000000] flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-black">برترین فریلنسر ها (تعداد پروژه)</span>
                    <div className="flex flex-col gap-1.5 text-[9px]">
                      {deptStats[0]?.topFreelancers?.map((f, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex justify-center items-center font-bold">
                            {f.username ? f.username.charAt(0).toUpperCase() : "?"}
                          </span>
                          <span className="w-16 pr-1 truncate">{f.firstName} {f.lastName}</span>
                          <div className="flex-1 h-2 bg-blue-100 rounded-full mx-1.5">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(f.projectCount * 10, 100)}%` }} />
                          </div>
                          <span className="font-bold text-blue-600 text-[10px]">{f.projectCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-black rounded-[5px] p-2.5 shadow-[0_3px_0_0_#000000] flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-black">برترین کارفرما ها (تعداد پروژه)</span>
                    <div className="flex flex-col gap-1.5 text-[9px]">
                      {deptStats[0]?.topEmployers?.map((emp, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex justify-center items-center font-bold">
                            {emp.username ? emp.username.charAt(0).toUpperCase() : "?"}
                          </span>
                          <span className="w-16 pr-1 truncate">{emp.firstName} {emp.lastName}</span>
                          <div className="flex-1 h-2 bg-blue-100 rounded-full mx-1.5">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(emp.projectCount * 10, 100)}%` }} />
                          </div>
                          <span className="font-bold text-blue-600 text-[10px]">{emp.projectCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-[18px] font-bold text-black">{currentDeptStat?.department?.name}</h2>
                  <div className="flex gap-2">
                      <button onClick={() => handleEditDepartment(currentDeptStat.department.id, currentDeptStat.department.name)} className="h-[28px] px-3 bg-blue-50 text-blue-600 border border-black rounded shadow-[0_2px_0_0_#000000] text-[10px] font-bold active:translate-y-[1px] cursor-pointer flex items-center gap-1">
                          <BiPencil /> ویرایش دپارتمان
                      </button>
                      <button onClick={() => handleDeleteDepartment(currentDeptStat.department.id)} className="h-[28px] px-3 bg-[#fecaca] text-[#dc2626] border border-black rounded shadow-[0_2px_0_0_#000000] text-[10px] font-bold active:translate-y-[1px] cursor-pointer flex items-center gap-1">
                          <BiTrash /> حذف دپارتمان
                      </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 w-full">
                  <div className="bg-white border border-black rounded-[5px] p-2 shadow-[0_2.5px_0_0_#000000] flex justify-between items-center">
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 block">پروژه‌ها</span>
                      <span className="text-[18px] font-bold text-black">{currentDeptStat?.projectsCount || 0}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex justify-center items-center text-base">
                      <BiCheckShield />
                    </div>
                  </div>
                  <div className="bg-white border border-black rounded-[5px] p-2 shadow-[0_2.5px_0_0_#000000] flex justify-between items-center">
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 block">کارفرما ها</span>
                      <span className="text-[18px] font-bold text-black">{currentDeptStat?.employersCount || 0}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex justify-center items-center text-base">
                      <BiBriefcase />
                    </div>
                  </div>
                  <div className="bg-white border border-black rounded-[5px] p-2 shadow-[0_2.5px_0_0_#000000] flex justify-between items-center">
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 block">فریلنسر ها</span>
                      <span className="text-[18px] font-bold text-black">{currentDeptStat?.freelancersCount || 0}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex justify-center items-center text-base">
                      <BiUser />
                    </div>
                  </div>
                </div>

                <div className="w-full flex gap-3 bg-white border border-black rounded-[6px] p-2.5 shadow-[0_3px_0_0_#000000]">
                  <div className="w-[280px] border border-gray-300 rounded-[5px] p-2.5 flex flex-col gap-2.5 shrink-0 bg-white">
                    {selectedDeptUser ? (
                      <>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex justify-center items-center font-bold text-[10px] shrink-0">
                              {selectedDeptUser.initial || "?"}
                            </div>
                            <span className="font-bold text-[11px] truncate max-w-[110px]">{selectedDeptUser.name}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[9px] text-right">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-gray-400">نام</label>
                            <input disabled value={selectedDeptUser.firstName || selectedDeptUser.name?.split(" ")[0]} className="w-full h-[26px] border border-gray-300 rounded px-1.5 text-center text-[10px] bg-gray-50 text-black font-medium" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-gray-400">نام خانوادگی</label>
                            <input disabled value={selectedDeptUser.lastName || selectedDeptUser.name?.split(" ")[1] || ""} className="w-full h-[26px] border border-gray-300 rounded px-1.5 text-center text-[10px] bg-gray-50 text-black font-medium" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-0.5 text-[9px] text-right">
                          <label className="text-gray-400">نام کاربری</label>
                          <input disabled value={selectedDeptUser.username || "—"} className="w-full h-[26px] border border-gray-300 rounded px-1.5 text-center text-[10px] bg-gray-50 font-mono text-black font-medium" />
                        </div>

                        <div className="flex flex-col gap-1.5 border-t border-gray-200 pt-2 text-[9px] text-right">
                          <label className="font-bold text-black text-[10px]">پروژه‌ها:</label>
                          <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto scrollbar-none pl-0.5">
                            {(selectedDeptUser.projects || selectedDeptUser.activeProjects || []).length > 0 ? (
                              (selectedDeptUser.projects || selectedDeptUser.activeProjects || []).map((p, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-[4px] text-[10px] text-right text-gray-800 font-medium leading-tight shrink-0 shadow-none hover:bg-gray-100 transition-colors">
                                  {p}
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 text-[9px]">پروژه‌ای ثبت نشده است</span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400 text-[10px] my-auto">کاربری در این دپارتمان وجود ندارد یا انتخاب نشده است</div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-2 border border-gray-300 rounded-[5px] p-2 bg-gray-50">
                    <div className="flex justify-between items-center bg-white p-1 rounded border border-gray-300 gap-1">
                      <div className="relative flex-1 max-w-[120px]">
                        <input type="text" placeholder="جستجو...." value={deptSearchQuery} onChange={(e) => setDeptSearchQuery(e.target.value)} className="w-full h-6 border border-gray-300 rounded px-1.5 pr-5 text-[9px] bg-gray-50 text-right focus:outline-none" />
                        <BiSearch className="absolute top-[6px] right-1 text-gray-400 text-[10px]" />
                      </div>

                      <div className="flex gap-0.5 text-[9px]">
                        <button onClick={() => { setDeptRoleTab("supervisors"); setDeptSearchQuery(""); setSelectedDeptUser(currentUsersList.supervisors[0]); }} className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${deptRoleTab === "supervisors" ? "bg-gray-200 text-black border border-gray-400" : "text-gray-500 hover:text-black"}`}>
                          <BiCheckShield className="inline ml-0.5 text-[10px]" /> ناظر ها
                        </button>
                        <button onClick={() => { setDeptRoleTab("employers"); setDeptSearchQuery(""); setSelectedDeptUser(currentUsersList.employers[0]); }} className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${deptRoleTab === "employers" ? "bg-gray-200 text-black border border-gray-400" : "text-gray-500 hover:text-black"}`}>
                          <BiBriefcase className="inline ml-0.5 text-[10px]" /> کارفرما ها
                        </button>
                        <button onClick={() => { setDeptRoleTab("freelancers"); setDeptSearchQuery(""); setSelectedDeptUser(currentUsersList.freelancers[0]); }} className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${deptRoleTab === "freelancers" ? "bg-gray-200 text-black border border-gray-400" : "text-gray-500 hover:text-black"}`}>
                          <BiUser className="inline ml-0.5 text-[10px]" /> فریلنسر ها
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[170px] scrollbar-none">
                      {filteredDeptUsers.length > 0 ? (
                        filteredDeptUsers.map((u, index) => (
                          <div key={u.id || index} onClick={() => setSelectedDeptUser(u)} className={`w-full h-[36px] p-1.5 border rounded flex justify-start items-center gap-2 cursor-pointer transition-all ${selectedDeptUser && (selectedDeptUser.id === u.id || selectedDeptUser.userId === u.userId) ? "bg-gray-200 border-gray-400 font-bold" : "bg-white border-transparent hover:bg-gray-100"}`}>
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex justify-center items-center text-[9px] font-bold shrink-0">{u.initial || "?"}</div>
                            <span className="text-[10px] text-black text-right flex-1 truncate">{u.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 text-[10px] py-4">کاربری در این لیست یافت نشد.</div>
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