// اتصال کامل فرانت‌اند به بک‌اند (Express/MongoDB)
// تمامی روت‌های پیاده‌سازی شده در بک‌اند (Auth, Projects, Tickets, Tasks, Finance, Notifications, Departments, Uploads) 
// در این فایل یکپارچه شده‌اند.

const BASE_URL = "http://localhost:3000/api";

const ROLE_HOME_PATH = {
  freelancer: "/dashboard",
  employer: "/employer-dashboard",
  supervisor: "/supervisor-dashboard",
  admin: "/admin/reports",
};

// ---------------------------------------------------------------------------
// ابزار کمکی برای ارسال درخواست‌ها به همراه توکن احراز هویت
// ---------------------------------------------------------------------------
async function apiFetch(endpoint, options = {}, isRetry = false) {
  const token = localStorage.getItem("accessToken");
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    let response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    let data = await response.json();

    // اگر توکن منقضی شده بود و این یک تلاش مجدد نیست
    if (response.status === 401 && !isRetry) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        });
        
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          localStorage.setItem("accessToken", refreshData.accessToken);
          localStorage.setItem("refreshToken", refreshData.refreshToken);
          // تلاش مجدد با توکن جدید
          return await apiFetch(endpoint, options, true);
        }
      }
      // اگر رفرش توکن هم منقضی بود
      logout();
      throw new Error("نشست شما پایان یافته است. لطفاً دوباره وارد شوید.");
    }

    if (!response.ok) throw new Error(data.message || "خطایی رخ داده است");
    return data;
  } catch (error) {
    throw error;
  }
}
// ---------------------------------------------------------------------------
// ابزارهای مپ کردن دیتای بک‌اند به فرمت مورد انتظار فرانت‌اند
// ---------------------------------------------------------------------------
function mapProject(p) {
  if (!p) return null;
  const emp = p.employerId || {};
  const sup = p.supervisorId || {};
  const dept = p.departmentId || {};
  const freelancers = p.freelancersId || [];

  return {
    id: p._id || p.id,
    title: p.title,
    description: p.description,
    budget: p.budget !== undefined ? p.budget : p.proposalBudget,
    proposalBudget: p.proposalBudget,
    paidAmount: p.paidAmount || 0,
    supervisor: sup.firstName ? `${sup.firstName} ${sup.lastName}` : "ناظر",
    supervisorId: sup._id,
    supervisorInitial: sup.username ? sup.username.charAt(0).toUpperCase() : "م",
    department: dept.name || "تعیین نشده",
    employer: emp.firstName ? `${emp.firstName} ${emp.lastName}` : "کارفرما",
    employerId: emp._id,
    employerInitial: emp.username ? emp.username.charAt(0).toUpperCase() : "ا",
    deadline: p.deadline ? new Date(p.deadline).toLocaleDateString('fa-IR') : "",
    isSuperProject: p.isSuperProject || false,
    progress: p.progress || 0,
    level: p.level || "c",
    priority: p.priority || "متوسط",
    status: p.status || "در انتظار بررسی",
    employerStatus: p.stage === "active" ? "در حال انجام" : p.stage === "completed" ? "خاتمه یافته" : "در انتظار شروع",
    stage: p.stage || "open",
    ticketId: p.ticketIds?.[0]?.ticketId?._id || p.ticketIds?.[0]?.ticketId || null,
    payments: p.payments || [],
    reviews: p.reviews || [],
    subProjects: p.subProjectsIds || [],
    freelancersList: freelancers.map((f) => ({
      id: f._id,
      firstName: f.firstName,
      lastName: f.lastName,
      username: f.username,
      initial: f.username ? f.username.charAt(0).toUpperCase() : "?",
      level: "سطح ۱", 
      score: "5/5"
    })),
    freelancersText: freelancers.length > 0 ? freelancers.map((f) => `${f.firstName} ${f.lastName}`).join(" ، ") : null,
    proposalStatus: p.stage === "open" ? "مشاهده درخواست‌ها" : undefined,
    applicationStatus: p.proposedCost ? "applied" : "not_applied", 
    proposedCost: p.proposedCost
  };
}

function mapTicket(t) {
  if (!t) return null;
  const partyStr = t.freelancer?.firstName ? `${t.freelancer.firstName} ${t.freelancer.lastName} | فریلنسر`
    : t.employer?.firstName ? `${t.employer.firstName} ${t.employer.lastName} | کارفرما`
    : t.supervisor?.firstName ? `${t.supervisor.firstName} ${t.supervisor.lastName} | ناظر`
    : "پشتیبانی";

  return {
    id: t._id || t.id,
    title: t.title,
    lastUpdate: t.lastUpdate ? new Date(t.lastUpdate).toLocaleDateString('fa-IR') : "اخیراً",
    department: t.department?.name || "پشتیبانی",
    party: partyStr,
    freelancerName: t.freelancer?.firstName ? `${t.freelancer.firstName} ${t.freelancer.lastName}` : null,
    supervisorName: t.supervisor?.firstName ? `${t.supervisor.firstName} ${t.supervisor.lastName}` : null,
    priority: t.priority,
    status: t.status === "closed" ? "بسته شده" : t.status === "replied" ? "پاسخ داده شده" : "در انتظار بررسی",
    type: t.stage,
    isClosed: t.stage === "archived",
    relatedProjectId: t.relatedProject?._id || t.relatedProject
  };
}


// ---------------------------------------------------------------------------
// توابع کاربری (Users & Auth)
// ---------------------------------------------------------------------------

export function getCurrentUserId(role) {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return (user.role === role || user.role === 'admin') ? (user.id || user._id) : null;
  } catch (e) {
    return null;
  }
}

export const getUserById = (id) => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id === id || user._id === id) return user;
    }
  } catch (e) {}
  return { id, initial: "U", firstName: "کاربر", lastName: "سیستم" };
};

export async function login({ identifier, password }) {
  try {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: identifier, password })
    });
    if (res.user) {
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      const userObj = { ...res.user, id: res.user.id || res.user._id, initial: (res.user.firstName || identifier).charAt(0).toUpperCase() };
      localStorage.setItem("user", JSON.stringify(userObj));
      return { ok: true, user: userObj, redirectPath: ROLE_HOME_PATH[res.user.role] };
    }
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  // The route guard in App.jsx will handle redirection when user becomes null
  // We avoid window.location.href to prevent hard page reloads
  import("../store/authStore").then((module) => {
    module.useAuthStore.getState().logout();
  });
}

export async function register(formData) {
  try {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...formData, username: formData.email.split('@')[0] })
    });
    if (res.user) {
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      return { ok: true, tempUserId: res.user.id };
    }
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function completeRegistration({ formData, role }) {
  try {
    const res = await apiFetch("/auth/register-role", {
      method: "POST",
      body: JSON.stringify({ role })
    });
    if (res.user) {
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      const userObj = { ...res.user, id: res.user.id || res.user._id, initial: (res.user.firstName || "U").charAt(0).toUpperCase() };
      localStorage.setItem("user", JSON.stringify(userObj));
      return { ok: true, user: userObj, redirectPath: ROLE_HOME_PATH[role] };
    }
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function getUsers({ role, query } = {}) {
  try {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (query) params.append('query', query);
    const res = await apiFetch(`/auth/users?${params.toString()}`);
    return res.users || [];
  } catch (err) {
    return [];
  }
}

export async function getDeptUserDirectory() {
  try {
    const res = await apiFetch(`/auth/users/department-directory`);
    return res.data;
  } catch (err) {
    return { nazers: [], karfarmas: [], freelancers: [] };
  }
}

export async function getUserDirectory() {
  try {
    const res = await apiFetch(`/auth/users/directory`);
    return res.users || [];
  } catch (err) {
    return [];
  }
}

export async function getUserProfile(id) {
  try {
    const res = await apiFetch(`/auth/users/${id}`);
    return res.data;
  } catch (err) {
    return null;
  }
}

export async function updateUser(id, payload) {
  try {
    const res = await apiFetch(`/auth/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return { ok: true, user: res.data };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ---------------------------------------------------------------------------
// دپارتمان‌ها (Departments)
// ---------------------------------------------------------------------------


export async function getDepartments() {
  try {
    return await apiFetch("/departments");
  } catch (err) {
    return [];
  }
}

export async function getDepartmentNames() {
  try {
    return await apiFetch("/departments/names");
  } catch (err) {
    return [];
  }
}
// + add this ability to front-end admin /admin/reports must create a field calld create department and through that admin can do that 
export async function createDepartment(payload) {
  try {
    const res = await apiFetch("/departments/create", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return { ok: true, department: res };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function getPriorities() {
  return ["زیاد", "متوسط", "کم"];
}

// ---------------------------------------------------------------------------
// پیشنهادات (Proposals)
// ---------------------------------------------------------------------------

export function getProposalsForProjectSync(projectId) {
  return []; // Mock sync counter, replaced by backend populated fields
}

export async function getProposalStatusLabel(projectId) {
  try {
    const res = await apiFetch(`/projects/${projectId}/proposals/statusLabel`);
    return res.label;
  } catch (err) {
    return "مشاهده درخواست‌ها";
  }
}

export async function getProposalsForProject(projectId) {
  try {
    const res = await apiFetch(`/projects/${projectId}/proposals`);
    return res.map(p => ({
      id: p._id,
      projectId: p.projectId?._id || p.projectId,
      freelancerId: p.freelancerId,
      status: p.status,
      proposedCost: p.proposedCost,
      note: p.note,
      submittedAt: p.submittedAt ? new Date(p.submittedAt).toLocaleDateString('fa-IR') : "",
      // Mapped fallbacks for UI
      firstName: "فریلنسر",
      lastName: "پلتفرم",
      username: "freelancer",
      initial: "F",
      level: "سطح ۱",
      score: "5/5"
    }));
  } catch (err) {
    return [];
  }
}

export async function createProposal(projectId, payload) {
  try {
    const res = await apiFetch(`/projects/${projectId}/proposals/create`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return { ok: true, proposal: res };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function reviewProposal({ projectId, freelancerId, status }) {
  try {
    const proposals = await getProposalsForProject(projectId);
    const target = proposals.find(p => p.freelancerId === freelancerId || p.id === freelancerId);
    if (!target) throw new Error("Proposal not found");

    await apiFetch(`/projects/${projectId}/proposals/${target.id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ---------------------------------------------------------------------------
// پروژه‌ها (Projects)
// ---------------------------------------------------------------------------

export async function getProjects({ stage, employerId, supervisorId, freelancerId, query } = {}) {
  try {
    const params = new URLSearchParams();
    if (stage) params.append('stage', stage);
    if (employerId) params.append('employerId', employerId);
    if (supervisorId) params.append('supervisorId', supervisorId);
    if (freelancerId) params.append('freelancerId', freelancerId);
    if (query) params.append('query', query);
    
    const res = await apiFetch(`/projects?${params.toString()}`);
    return (res.projects || []).map(mapProject);
  } catch (err) {
    return [];
  }
}

export async function getProjectById(id, opts = {}) {
  try {
    const res = await apiFetch(`/projects/${id}`);
    return res.result ? mapProject(res.result) : null;
  } catch (err) {
    return null;
  }
}

export async function createProject(payload) {
  try {
    const res = await apiFetch("/projects", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return { ok: true, project: mapProject(res.project) };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function updateProject(id, payload) {
  try {
    const res = await apiFetch(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return { ok: true, project: mapProject(res) };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function deleteProject(id) {
  try {
    await apiFetch(`/projects/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function assignFreelancer({ projectId, freelancerId }) {
  try {
    const res = await apiFetch(`/projects/${projectId}/assign`, {
      method: "POST",
      body: JSON.stringify({ freelancerId })
    });
    return { ok: true, project: mapProject(res.project) };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function declareReadiness({ projectId }) {
  try {
    await apiFetch(`/projects/${projectId}/apply`, { method: "POST" });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function terminateProject({ projectId, role, rating, comment }) {
  try {
    // 1. Add Review
    await apiFetch(`/projects/${projectId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment })
    });
    // 2. Confirm Result (Ends project)
    const confRes = await apiFetch(`/projects/${projectId}/confirmResult`, { method: "POST" });
    return { ok: true, project: mapProject(confRes.project) };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function addProjectReview({ projectId, role, rating, comment }) {
  try {
    const res = await apiFetch(`/projects/${projectId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment })
    });
    return { ok: true, review: res.review };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function editRequestByEmployer(projectId) {
  try {
    const res = await apiFetch(`/projects/${projectId}/submit/editRequest`, { method: "POST" });
    return { ok: true, project: res.project };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function addProjectPayment({ projectId, title, amount }) {
  try {
    // Backend doesn't have a direct payment insert, using project PUT as fallback
    const projRes = await apiFetch(`/projects/${projectId}`);
    const proj = projRes.result;
    const newPayments = [...(proj.payments || []), { title, amount: Number(amount) }];
    
    await apiFetch(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify({ payments: newPayments, paidAmount: (proj.paidAmount || 0) + Number(amount) })
    });
    return { ok: true, payment: newPayments[newPayments.length - 1] };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function editProjectPrice({ projectId, newPrice }) {
  try {
    const projRes = await apiFetch(`/projects/${projectId}`);
    const freelancerId = projRes.result?.freelancersId?.[0]?._id; 
    
    await apiFetch(`/projects/${projectId}/price`, {
      method: "PUT",
      body: JSON.stringify({ freelancerId, newPrice })
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function convertTicketToProject(payload) {
  try {
    const res = await apiFetch(`/tickets/${payload.ticketId}/convert`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return { ok: true, project: mapProject(res.project) };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ---------------------------------------------------------------------------
// تیکت‌ها (Tickets)
// ---------------------------------------------------------------------------

export async function getTickets({ stage, employerId, supervisorId, freelancerId, query } = {}) {
  try {
    const params = new URLSearchParams();
    if (stage) params.append('stage', stage);
    if (employerId) params.append('employer', employerId);
    if (supervisorId) params.append('supervisor', supervisorId);
    if (freelancerId) params.append('freelancer', freelancerId);
    if (query) params.append('query', query);

    const res = await apiFetch(`/tickets?${params.toString()}`);
    return (res.tickets || []).map(mapTicket);
  } catch (err) {
    return [];
  }
}

export async function getTicketById(id) {
  try {
    const res = await apiFetch(`/tickets/find/${id}`);
    return mapTicket(res);
  } catch (err) {
    return null;
  }
}

export async function createTicket(payload) {
  try {
    const res = await apiFetch("/tickets", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return { ok: true, ticket: mapTicket(res) };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function updateTicket(id, payload) {
  try {
    const res = await apiFetch(`/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return { ok: true, ticket: mapTicket(res) };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function deleteTicket(id) {
  try {
    await apiFetch(`/tickets/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function getTicketMessages(ticketId) {
  try {
    const res = await apiFetch(`/tickets/${ticketId}/messages`);
    return res.map(m => ({
      id: m._id,
      senderRole: m.senderRole,
      text: m.text,
      fileUrl: m.fileUrl ? `http://localhost:3000${m.fileUrl}` : null,
      isFinalFile: m.isFinalFile,
      time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : ""
    }));
  } catch (err) {
    return [];
  }
}

export async function sendTicketMessage({ ticketId, senderRole, senderId, text, fileUrl, isFinalFile }) {
  try {
    const res = await apiFetch(`/tickets/${ticketId}/messages`, {
      method: "POST",
      // ارسال لینک فایل به بک‌اند در صورت وجود
      body: JSON.stringify({ text, fileUrl, isFinalFile }) 
    });
    return { ok: true, message: {
      id: res._id,
      senderRole: res.senderRole,
      text: res.text,
      fileUrl: res.fileUrl, // مپ کردن فایل در جواب
      isFinalFile: res.isFinalFile,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    }};
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function verifyFreelancer(ticketId, payload) {
  try {
    const res = await apiFetch(`/tickets/${ticketId}/verifyFreelancer`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return { ok: true, result: res };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}


// ---------------------------------------------------------------------------
// تسک‌ها (Tasks)
// ---------------------------------------------------------------------------

export async function createTask(payload) {
  try {
    const res = await apiFetch("/tasks/create", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return { ok: true, task: res };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function getTasks({ freelancerId, columns } = {}) {
  try {
    const res = await apiFetch(`/tasks?freelancerId=${freelancerId || ""}&columns=${columns || ""}`);
    return res || [];
  } catch (err) {
    return [];
  }
}

export async function getTaskBoard({ freelancerId } = {}) {
  try {
    const res = await apiFetch(`/tasks/getTaskBoard?freelancerId=${freelancerId || ""}`);
    return res || { deposited: [], suggestions: [], completed: [] };
  } catch (err) {
    return { deposited: [], suggestions: [], completed: [] };
  }
}

export async function getEmployerTaskReports({ employerId } = {}) {
  try {
    const res = await apiFetch(`/tasks/getEmployerTaskReports?employerId=${employerId || ""}`);
    return res || { deposited: [], completed: [] };
  } catch (err) {
    return { deposited: [], completed: [] };
  }
}


// ---------------------------------------------------------------------------
// امور مالی (Finance)
// ---------------------------------------------------------------------------

export async function getFinanceStats() {
  try {
    const res = await apiFetch("/finance/stats");
    return res.financeStats || {};
  } catch (err) {
    return {};
  }
}

export async function getFinanceProjects() {
  try {
    const res = await apiFetch("/finance");
    return res.financeProjects || [];
  } catch (err) {
    return [];
  }
}

export async function getFinanceProjectById(id) {
  try {
    return await apiFetch(`/finance/${id}`);
  } catch (err) {
    return null;
  }
}

export async function createFinanceProject(payload) {
  try {
    const res = await apiFetch("/finance", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return { ok: true, project: res };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
// + /supervisor-finance there for each finacne project supervisor can create addTransaction with select box and can easily enter its data and send for the api 
export async function addTransaction(financeProjectId, payload) {
  try {
    const res = await apiFetch(`/finance/${financeProjectId}/transactions`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return { ok: true, transaction: res.transaction };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// export async function releaseFinanceTransaction({ financeProjectId, amount, freelancerName }) {
//   try {
//     const users = await getUsers({ role: 'freelancer' });
//     const target = users.find(u => `${u.firstName} ${u.lastName}` === freelancerName);
    
//     if (!target) throw new Error("فریلنسری با این نام یافت نشد.");

//     const res = await apiFetch(`/finance/${financeProjectId}/transactions/dummy/release`, {
//       method: "POST",
//       body: JSON.stringify({ amount: Number(amount), freelancerId: target._id || target.id })
//     });
//     return { ok: true, transaction: res.transaction };
//   } catch (err) {
//     return { ok: false, message: err.message };
//   }
// }

export async function getWallet(employerId) {
  return { balance: 238000000 };
}

export async function chargeWallet({ employerId, amount }) {
  return { ok: true, balance: 238000000 + Number(amount) };
}

export async function releasePayment({ projectId, freelancerId, amount }) {
  return await addProjectPayment({
    projectId,
    title: `آزادسازی وجه به فریلنسر`,
    amount
  });
}

// ---------------------------------------------------------------------------
// اعلانات و سایر موارد (Notifications & Misc)
// ---------------------------------------------------------------------------

export async function getNotifications() {
  try {
    const res = await apiFetch("/notifications");
    return res.notifications || [];
  } catch (err) {
    return [];
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    await apiFetch(`/notifications/${notificationId}/read`, { method: "PUT" });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function getReports() {
  try {
    const res = await apiFetch("/notifications");
    return res.notifications || [];
  } catch (err) {
    return [];
  }
}

export async function previewReport(filters) {
  try {
    const res = await apiFetch("/reports/preview", {
      method: "POST",
      body: JSON.stringify(filters)
    });
    return { ok: true, report: res.report };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function getRevenueByMonth() {
  // ماک موقت برای چارت فرانت‌اند
  return [
    { id: 1, name: "فروردین", income: 1000000 },
    { id: 2, name: "اردیبهشت", income: 3500000 },
    { id: 3, name: "خرداد", income: 2000000 },
    { id: 4, name: "تیر", income: 5000000 },
    { id: 5, name: "مرداد", income: 4200000 },
    { id: 6, name: "شهریور", income: 8500000 },
    { id: 7, name: "مهر", income: 6000000 },
    { id: 8, name: "آبان", income: 9000000 },
    { id: 9, name: "آذر", income: 4000000 },
    { id: 10, name: "دی", income: 7200000 },
    { id: 11, name: "بهمن", income: 11000000 },
    { id: 12, name: "اسفند", income: 15000000 }
  ];
}

export async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiFetch("/uploads", {
      method: "POST",
      body: formData
    });
    return { ok: true, url: res.file.url };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}


// ---------------------------------------------------------------------------
// روت‌های گمشده پروفایل و دپارتمان‌ها
// ---------------------------------------------------------------------------
// + create a user section that shows data from results
export async function getMyProfile() {
  try {
    const res = await apiFetch("/auth/me");
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
// + just for /admin/reports
export async function updateDepartment(id, payload) {
  try {
    const res = await apiFetch(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return { ok: true, department: res };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
// + /admin/reports حذف دپارتمان باید پیاده سازی شود
export async function deleteDepartment(id) {
  try {
    await apiFetch(`/departments/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function getDepartmentsStats() {
  try {
    return await apiFetch("/departments/stats");
  } catch (err) {
    return null;
  }
}
// + just for admin , /admin/reports,دپارتمان/دپارتمان ها (بیشتر برای اینه که بفهمیم کی زیر دست گیخه به کمک این تابع راحت میشه فهمید اطلاعات را گرفته و بگو کی زیر دست کیه)
export async function getDepartmentUserStats(departmentId) {
  try {
    return await apiFetch(`/departments/user-stats/${departmentId}`);
  } catch (err) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// روت‌های گمشده پروژه‌ها و پروپوزال‌ها
// ---------------------------------------------------------------------------

export async function getFinanceProjectByProjectId(projectId) {
  try {
    return await apiFetch(`/projects/${projectId}/finance`);
  } catch (err) {
    return null;
  }
}

export async function confirmResultResult(projectId) {
  try {
    const res = await apiFetch(`/projects/${projectId}/confirmResult`, { method: "POST" });
    return { ok: true, project: res.project };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function readProposalById(projectId, proposalId) {
  try {
    return await apiFetch(`/projects/${projectId}/proposals/${proposalId}`);
  } catch (err) {
    return null;
  }
}

export async function deleteProposal(projectId, proposalId) {
  try {
    await apiFetch(`/projects/${projectId}/proposals/${proposalId}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ---------------------------------------------------------------------------
// روت‌های گمشده چت و پیام‌های تیکت
// ---------------------------------------------------------------------------

export async function deleteMessage(ticketId, messageId) {
  try {
    await apiFetch(`/tickets/${ticketId}/messages/${messageId}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function updateMessage(ticketId, messageId, payload) {
  try {
    const res = await apiFetch(`/tickets/${ticketId}/messages/${messageId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return { ok: true, message: res };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ---------------------------------------------------------------------------
// روت‌های گمشده و اصلاح‌شده مالی (Finance)
// ---------------------------------------------------------------------------

export async function updateFinanceProject(id, payload) {
  try {
    const res = await apiFetch(`/finance/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return { ok: true, project: res };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function deleteFinanceProject(id) {
  try {
    await apiFetch(`/finance/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function readTransactions(financeProjectId) {
  try {
    return await apiFetch(`/finance/${financeProjectId}/transactions`);
  } catch (err) {
    return [];
  }
}

export async function deleteTransaction(financeProjectId, transactionId) {
  try {
    await apiFetch(`/finance/${financeProjectId}/transactions/${transactionId}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// جایگزین کردن تابع قبلی (اصلاح آدرس بر اساس روترهای بک‌اند)
export async function releaseFinanceTransaction({ financeProjectId, transactionId, amount, freelancerId }) {
  try {
    const res = await apiFetch(`/finance/${financeProjectId}/transactions/${transactionId}/release`, {
      method: "POST",
      body: JSON.stringify({ amount: Number(amount), freelancerId })
    });
    return { ok: true, transaction: res.transaction };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ---------------------------------------------------------------------------
// روت‌های گمشده سیستم اعلانات
// ---------------------------------------------------------------------------

export async function createNotification(payload) {
  try {
    const res = await apiFetch("/notifications/create", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return { ok: true, notification: res.notification };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function getNotificationById(id) {
  try {
    return await apiFetch(`/notifications/${id}`);
  } catch (err) {
    return null;
  }
}

export async function updateNotification(id, payload) {
  try {
    const res = await apiFetch(`/notifications/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return { ok: true, notification: res.notification };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function deleteNotification(id) {
  try {
    await apiFetch(`/notifications/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ---------------------------------------------------------------------------
// لاگ‌های سیستم (Admin Only)
// ---------------------------------------------------------------------------

/**
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=30]
 * @param {string} [params.search]
 * @param {string} [params.method]       - GET|POST|PUT|DELETE
 * @param {number} [params.statusCode]
 * @param {string} [params.userId]
 * @param {string} [params.startDate]    - ISO date string
 * @param {string} [params.endDate]      - ISO date string
 * @returns {Promise<{ logs: Array, pagination: Object }>}
 */
export async function getLogs(params = {}) {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return await apiFetch(`/logs${qs ? `?${qs}` : ""}`);
  } catch (err) {
    return { logs: [], pagination: { page: 1, limit: 30, totalDocs: 0, totalPages: 0 } };
  }
}