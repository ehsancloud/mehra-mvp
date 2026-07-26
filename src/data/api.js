// Mock API layer.
//
// TODO(API): every exported function here is meant to become a real network
// call (fetch/axios) to the backend, keeping the same name, parameters and
// return shape. Components only ever import from this file (never from
// db.json directly), so once these functions call the real API instead of
// the in-memory store, no other file in src/ needs to change.
//
// All functions are async and return plain, JSON-serializable data (no
// class instances, no React state) so they behave exactly like a fetch()
// response would.
import { getStore, readCollection, writeCollection } from "./db";
import {
  PROJECT_STATUS_LABELS,
  EMPLOYER_STAGE_LABELS,
} from "../utils/projectStatus";
import { getLevelLabel } from "../utils/projectLevels";
import { TICKET_STATUS_LABELS } from "../utils/tickets";

// Simulated network latency so loading states behave like they will
// against a real API. Set to 0 to disable during local debugging.
const LATENCY_MS = 120;
const delay = (ms = LATENCY_MS) => new Promise((res) => setTimeout(res, ms));

const byId = (list, id) => list.find((item) => item.id === id) || null;

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const userDisplayName = (user) =>
  user ? `${user.firstName} ${user.lastName}`.trim() : "";

export const getUserById = (id) => {
  const users = readCollection("users");
  return byId(users, id);
};

export async function getUsers({ role, query } = {}) {
  await delay();
  let users = readCollection("users");
  if (role) users = users.filter((u) => u.role === role);
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    users = users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }
  return users;
}

// Grouped by role for the admin "department management" org-chart tab
// (supervisors / employers / freelancers), each with the extra fields that
// screen displays (assigned projects, outstanding debt/credit).
export async function getDeptUserDirectory() {
  await delay();
  const users = readCollection("users");
  const projects = readCollection("projects");

  const projectTitlesFor = (predicate) =>
    projects.filter(predicate).map((p) => p.title);

  return {
    nazers: users
      .filter((u) => u.role === "supervisor")
      .map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        initial: u.initial,
        username: u.username,
        role: "nazer",
        projects: projectTitlesFor((p) => p.supervisorId === u.id),
      })),
    karfarmas: users
      .filter((u) => u.role === "employer")
      .map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        initial: u.initial,
        username: u.username,
        role: "karfarma",
        debt: 0, // TODO(API): sum of this employer's unpaid project balances
        activeProjects: projectTitlesFor(
          (p) => p.employerId === u.id && p.stage === "active",
        ),
      })),
    freelancers: users
      .filter((u) => u.role === "freelancer")
      .map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        initial: u.initial,
        username: u.username,
        role: "freelancer",
        credit: u.income || 0,
      })),
  };
}

const ROLE_LABELS = {
  freelancer: "فریلنسر",
  employer: "کارفرما",
  supervisor: "ناظر",
  admin: "ادمین",
  normal: "کاربر عادی",
};

// Every user across every role, with the extra display fields the admin
// "all users" tab needs (roleKey to filter by, roleText to show).
export async function getUserDirectory() {
  await delay();
  return readCollection("users").map((u) => ({
    ...u,
    roleKey: u.role,
    roleText: ROLE_LABELS[u.role] || u.role,
    levelLabel: u.level ? getLevelLabel(u.level) : null,
  }));
}

export async function getUserProfile(id) {
  await delay();
  const user = getUserById(id);
  if (!user) return null;
  const projects = readCollection("projects").filter((p) =>
    (p.freelancerIds || []).includes(id) || p.employerId === id,
  );
  return {
    ...user,
    levelLabel: user.level ? getLevelLabel(user.level) : null,
    skills: (user.skills || []).map((depId) => resolveDepartmentName(depId)),
    projects: projects.map((p, idx) => ({
      id: p.id,
      title: p.title,
      isHighlighted: idx === 0,
    })),
  };
}

export async function updateUser(id, payload) {
  await delay();
  const users = readCollection("users");
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return { ok: false, message: "کاربر یافت نشد." };
  users[idx] = { ...users[idx], ...payload };
  writeCollection("users", users);
  // TODO(API): PATCH /users/{id}
  return { ok: true, user: users[idx] };
}

export function getCurrentUserId(role) {
  const { currentSession } = getStore();
  return currentSession[`${role}Id`] || null;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const ROLE_HOME_PATH = {
  freelancer: "/dashboard",
  employer: "/employer-dashboard",
  supervisor: "/supervisor-dashboard",
  admin: "/admin/reports",
};

// TODO(API): POST /auth/login { identifier, password } -> { token, user }
export async function login({ identifier, password }) {
  await delay(300);
  const id = (identifier || "").trim().toLowerCase();
  const users = readCollection("users");
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === id ||
      u.email.toLowerCase() === id ||
      u.phone === id,
  );

  if (!user || user.password !== password) {
    return { ok: false, message: "نام کاربری یا رمز عبور اشتباه است." };
  }

  return { ok: true, user, redirectPath: ROLE_HOME_PATH[user.role] };
}

// TODO(API): POST /auth/register { ...formData } -> { tempUserId }
// Real backend should validate uniqueness of email/phone/nationalCode
// server-side and return field-level errors on conflict.
export async function register(formData) {
  await delay(300);
  const users = readCollection("users");

  if (users.some((u) => u.email.toLowerCase() === formData.email.toLowerCase())) {
    return { ok: false, field: "email", message: "این ایمیل قبلاً ثبت شده است." };
  }
  if (users.some((u) => u.phone === formData.phone)) {
    return { ok: false, field: "phone", message: "این شماره همراه قبلاً ثبت شده است." };
  }
  if (users.some((u) => u.nationalCode === formData.nationalCode)) {
    return { ok: false, field: "nationalCode", message: "این کد ملی قبلاً ثبت شده است." };
  }

  return { ok: true, tempUserId: `pending-${Date.now()}` };
}

// TODO(API): POST /auth/register/complete { tempUserId, role } -> { token, user }
export async function completeRegistration({ formData, role }) {
  await delay(300);
  const users = readCollection("users");
  const roleLabel = role === "freelancer" ? "فریلنسر" : "کارفرما";

  const newUser = {
    id: `u-new-${Date.now()}`,
    role,
    firstName: formData.firstName,
    lastName: formData.lastName,
    username: `${formData.firstName}.${formData.lastName}`.replace(/\s+/g, ""),
    uniqueId: `${role === "freelancer" ? "FR" : "EM"}${Date.now()}`,
    email: formData.email,
    phone: formData.phone,
    nationalCode: formData.nationalCode,
    password: formData.password,
    initial: (formData.firstName || "?").charAt(0),
    avatarColor: role === "freelancer" ? "#3b82f6" : "#b90000",
    roles: [roleLabel],
    status: "active",
    createdAt: formData.birthDate || null,
    ...(role === "freelancer"
      ? { level: "c", income: 0, skills: [] }
      : { walletBalance: 0 }),
  };

  users.push(newUser);
  writeCollection("users", users);
  return { ok: true, user: newUser, redirectPath: ROLE_HOME_PATH[role] };
}

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

export function resolveDepartmentName(departmentId) {
  const departments = readCollection("departments");
  const dep = departments.find((d) => d.id === departmentId);
  return dep ? dep.name : departmentId;
}

function resolveDepartmentId(name) {
  const departments = readCollection("departments");
  const dep = departments.find((d) => d.name === name);
  return dep ? dep.id : name;
}

export async function getDepartments() {
  await delay();
  return readCollection("departments");
}

export async function getDepartmentNames() {
  await delay();
  return readCollection("departments").map((d) => d.name);
}

export async function getPriorities() {
  await delay(0);
  return readCollection("priorities");
}

// ---------------------------------------------------------------------------
// Proposals (freelancer applications on an open project)
// ---------------------------------------------------------------------------

export function getProposalsForProjectSync(projectId) {
  return readCollection("proposals").filter((p) => p.projectId === projectId);
}

// Human-readable summary shown on the project card, e.g. "3 درخواست ثبت شده"
// or "پیشنهادی ثبت نشده". Always derived from the actual proposal count so
// it can never drift out of sync with the real data.
export function getProposalStatusLabel(projectId) {
  const count = getProposalsForProjectSync(projectId).length;
  return count > 0 ? `${count.toLocaleString("fa-IR")} درخواست ثبت شده` : "پیشنهادی ثبت نشده";
}

export async function getProposalsForProject(projectId) {
  await delay();
  return getProposalsForProjectSync(projectId).map((proposal) => {
    const freelancer = getUserById(proposal.freelancerId);
    return {
      ...proposal,
      id: freelancer?.id ?? proposal.id,
      firstName: freelancer?.firstName,
      lastName: freelancer?.lastName,
      username: freelancer?.username,
      initial: freelancer?.initial,
      level: freelancer?.level ? getLevelLabel(freelancer.level) : null,
      score: "4.5/5", // TODO(API): replace with the freelancer's real average rating
      income: freelancer?.income,
      skills: (freelancer?.skills || []).map(resolveDepartmentName),
    };
  });
}

// TODO(API): PATCH /proposals/{id} { status: 'accepted' | 'rejected' }
export async function reviewProposal({ projectId, freelancerId, status }) {
  await delay();
  const proposals = readCollection("proposals");
  const idx = proposals.findIndex(
    (p) => p.projectId === projectId && p.freelancerId === freelancerId,
  );
  if (idx !== -1) {
    proposals[idx] = { ...proposals[idx], status };
    writeCollection("proposals", proposals);
  }

  if (status === "accepted") {
    const projects = readCollection("projects");
    const pIdx = projects.findIndex((p) => p.id === projectId);
    if (pIdx !== -1) {
      projects[pIdx] = {
        ...projects[pIdx],
        freelancerIds: [...new Set([...(projects[pIdx].freelancerIds || []), freelancerId])],
      };
      writeCollection("projects", projects);
    }
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const formatSubProjectView = (subId) => {
  const sub = byId(readCollection("projects"), subId);
  if (!sub) return null;
  return {
    id: sub.id,
    title: sub.title,
    status: PROJECT_STATUS_LABELS[sub.status] || sub.status,
  };
};

// Shapes a raw project record from the DB into the flat view shape every
// project card / details modal already expects (resolved names instead of
// ids, Persian status labels instead of codes, etc). Keeping this in one
// place means every screen renders projects the exact same way.
function toProjectView(project, { freelancerId } = {}) {
  const employer = getUserById(project.employerId);
  const supervisor = getUserById(project.supervisorId);
  const freelancers = (project.freelancerIds || [])
    .map((id) => getUserById(id))
    .filter(Boolean);

  let applicationStatus;
  if (freelancerId && project.stage === "open") {
    const myProposal = readCollection("proposals").find(
      (p) => p.projectId === project.id && p.freelancerId === freelancerId,
    );
    if (!myProposal) {
      applicationStatus = "not_applied";
    } else if (myProposal.status === "rejected") {
      applicationStatus = "rejected";
    } else {
      // "pending" (awaiting supervisor review) and "accepted" both read as
      // "already applied" from the freelancer's own readiness button.
      applicationStatus = "applied";
    }
  }

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    budget: project.budget,
    paidAmount: project.paidAmount,
    supervisor: userDisplayName(supervisor),
    supervisorId: project.supervisorId,
    supervisorInitial: supervisor?.initial || "?",
    department: resolveDepartmentName(project.departmentId),
    employer: userDisplayName(employer),
    employerId: project.employerId,
    employerInitial: employer?.initial || "?",
    deadline: project.deadline,
    isSuperProject: project.isSuperProject,
    progress: project.progress,
    level: project.level,
    priority: project.priority,
    status: PROJECT_STATUS_LABELS[project.status] || project.status,
    employerStatus: EMPLOYER_STAGE_LABELS[project.stage] || project.status,
    applicationStatus,
    stage: project.stage,
    ticketId: project.ticketId,
    payments: project.payments || [],
    reviews: project.reviews || [],
    subProjects: (project.subProjectIds || [])
      .map(formatSubProjectView)
      .filter(Boolean),
    freelancersList: freelancers.map((f) => ({
      id: f.id,
      firstName: f.firstName,
      lastName: f.lastName,
      username: f.username,
      initial: f.initial,
      level: getLevelLabel(f.level),
      score: "4.5/5",
    })),
    freelancersText: freelancers.map((f) => userDisplayName(f)).join(" ، ") || null,
    proposalStatus:
      project.stage === "open" ? getProposalStatusLabel(project.id) : undefined,
  };
}

export async function getProjects({
  stage,
  employerId,
  supervisorId,
  freelancerId,
  query,
} = {}) {
  await delay();
  let projects = readCollection("projects");

  if (stage) projects = projects.filter((p) => p.stage === stage);
  if (employerId) projects = projects.filter((p) => p.employerId === employerId);
  if (supervisorId) projects = projects.filter((p) => p.supervisorId === supervisorId);
  if (freelancerId) {
    // For the freelancer panel: open projects are visible to everyone
    // (gated by level in the UI), active/completed only if assigned to them.
    projects = projects.filter(
      (p) =>
        p.stage === "open" || (p.freelancerIds || []).includes(freelancerId),
    );
  }

  const views = projects.map((p) => toProjectView(p, { freelancerId }));

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    return views.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.department || "").toLowerCase().includes(q) ||
        (p.supervisor || "").toLowerCase().includes(q) ||
        (p.employer || "").toLowerCase().includes(q) ||
        (p.freelancersText || "").toLowerCase().includes(q),
    );
  }

  return views;
}

export async function getProjectById(id, opts = {}) {
  await delay();
  const project = byId(readCollection("projects"), id);
  return project ? toProjectView(project, opts) : null;
}

// TODO(API): POST /projects. When isSuperProject is true, the backend
// should create the parent project plus one child project per entry in
// subProjects, then link them via subProjectIds - each child then follows
// the exact same lifecycle (assignment, tickets, payments, termination) as
// a regular project.
export async function createProject(payload) {
  await delay(250);
  const projects = readCollection("projects");
  const newId = `p-new-${Date.now()}`;

  const base = {
    id: newId,
    title: payload.title,
    description: payload.description || "",
    departmentId: resolveDepartmentId(payload.department),
    priority: payload.priority,
    level: payload.level || "c",
    budget: Number(payload.cost) || 0,
    paidAmount: 0,
    deadline: payload.deadline,
    createdAt: new Date().toISOString(),
    employerId: payload.employerId || getCurrentUserId("employer"),
    supervisorId: payload.supervisorId || getCurrentUserId("supervisor"),
    freelancerIds: [],
    stage: "open",
    status: null,
    ticketId: payload.ticketId || null,
    payments: [],
    reviews: [],
  };

  if (payload.isSuperProject && Array.isArray(payload.subProjects)) {
    const subIds = payload.subProjects.map((sub, index) => {
      const subId = `${newId}-sub-${index + 1}`;
      projects.push({
        ...base,
        id: subId,
        title: sub.title,
        budget: Number(sub.cost) || 0,
        deadline: sub.deadline || payload.deadline,
        isSuperProject: false,
        subProjectIds: [],
        progress: 0,
      });
      return subId;
    });

    const superProject = {
      ...base,
      isSuperProject: true,
      subProjectIds: subIds,
      progress: 0,
      stage: "active",
      status: "awaiting_submission",
    };
    projects.push(superProject);
    writeCollection("projects", projects);
    return { ok: true, project: toProjectView(superProject) };
  }

  const project = { ...base, isSuperProject: false, subProjectIds: [], progress: 0 };
  projects.push(project);
  writeCollection("projects", projects);
  return { ok: true, project: toProjectView(project) };
}

// TODO(API): PATCH /projects/{id}
export async function updateProject(id, payload) {
  await delay(250);
  const projects = readCollection("projects");
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return { ok: false, message: "پروژه یافت نشد." };

  const patch = { ...payload };
  if (payload.department) {
    patch.departmentId = resolveDepartmentId(payload.department);
    delete patch.department;
  }
  if (payload.cost !== undefined) {
    patch.budget = Number(payload.cost) || 0;
    delete patch.cost;
  }

  projects[idx] = { ...projects[idx], ...patch };
  writeCollection("projects", projects);
  return { ok: true, project: toProjectView(projects[idx]) };
}

// TODO(API): POST /projects/{id}/assign { freelancerId }
export async function assignFreelancer({ projectId, freelancerId }) {
  await delay(250);
  const projects = readCollection("projects");
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return { ok: false };

  projects[idx] = {
    ...projects[idx],
    freelancerIds: [...new Set([...(projects[idx].freelancerIds || []), freelancerId])],
    stage: "active",
    status: projects[idx].status || "awaiting_submission",
  };
  writeCollection("projects", projects);
  return { ok: true, project: toProjectView(projects[idx]) };
}

// TODO(API): POST /projects/{id}/apply (freelancer declares readiness for
// an open project) - creates a `proposals` row with status "pending".
export async function declareReadiness({ projectId, freelancerId }) {
  await delay(250);
  const proposals = readCollection("proposals");
  const already = proposals.some(
    (p) => p.projectId === projectId && p.freelancerId === freelancerId,
  );
  if (!already) {
    proposals.push({
      id: `prop-${Date.now()}`,
      projectId,
      freelancerId,
      status: "pending",
      proposedCost: null,
      note: "",
      submittedAt: new Date().toISOString(),
    });
    writeCollection("proposals", proposals);
  }
  return { ok: true };
}

// TODO(API): POST /projects/{id}/terminate { role, rating, comment }
// Used by both the employer and the supervisor termination popup - the
// `role` field tells the backend which side is closing the project.
export async function terminateProject({ projectId, role, rating, comment }) {
  await delay(250);
  const projects = readCollection("projects");
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return { ok: false, message: "پروژه یافت نشد." };

  const rater = getUserById(getCurrentUserId(role));
  const review = {
    id: `rev-${Date.now()}`,
    role,
    raterName: userDisplayName(rater) || (role === "employer" ? "کارفرما" : "ناظر"),
    initial: rater?.initial || (role === "employer" ? "A" : "M"),
    stars: rating,
    text: comment,
    createdAt: new Date().toISOString(),
  };

  projects[idx] = {
    ...projects[idx],
    stage: "completed",
    status: "closed",
    reviews: [...(projects[idx].reviews || []), review],
  };
  writeCollection("projects", projects);
  return { ok: true, project: toProjectView(projects[idx]) };
}

// TODO(API): POST /projects/{id}/reviews { rating, comment } - adds a
// follow-up review on an already-completed project (does not change status).
export async function addProjectReview({ projectId, role, rating, comment }) {
  await delay(250);
  const projects = readCollection("projects");
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return { ok: false };

  const rater = getUserById(getCurrentUserId(role));
  const review = {
    id: `rev-${Date.now()}`,
    role,
    raterName: userDisplayName(rater) || (role === "employer" ? "کارفرما" : "ناظر"),
    initial: rater?.initial || (role === "employer" ? "A" : "M"),
    stars: rating,
    text: comment,
    createdAt: new Date().toISOString(),
  };
  projects[idx] = { ...projects[idx], reviews: [...(projects[idx].reviews || []), review] };
  writeCollection("projects", projects);
  return { ok: true, review };
}

// TODO(API): POST /projects/{id}/payments { title, amount }
export async function addProjectPayment({ projectId, title, amount }) {
  await delay(250);
  const projects = readCollection("projects");
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return { ok: false };

  const payment = {
    id: `pay-${Date.now()}`,
    title,
    amount: Number(amount) || 0,
    date: new Date().toISOString(),
  };
  projects[idx] = {
    ...projects[idx],
    payments: [...(projects[idx].payments || []), payment],
    paidAmount: (projects[idx].paidAmount || 0) + payment.amount,
  };
  writeCollection("projects", projects);
  return { ok: true, payment };
}

// TODO(API): PATCH /projects/{id}/price { newPrice } - the supervisor/admin
// "edit freelancer cost" action from inside the ticket chat.
export async function editProjectPrice({ projectId, newPrice }) {
  await delay(250);
  const projects = readCollection("projects");
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return { ok: false, message: "پروژه یافت نشد." };
  projects[idx] = { ...projects[idx], budget: Number(newPrice) || projects[idx].budget };
  writeCollection("projects", projects);
  return { ok: true, project: toProjectView(projects[idx]) };
}

// TODO(API): POST /tickets/{id}/convert - turns a ticket into a fully
// defined project, following the same createProject contract above
// (including optional isSuperProject/subProjects).
export async function convertTicketToProject(payload) {
  const result = await createProject(payload);
  if (result.ok && payload.ticketId) {
    const tickets = readCollection("tickets");
    const tIdx = tickets.findIndex((t) => t.id === payload.ticketId);
    if (tIdx !== -1) {
      tickets[tIdx] = { ...tickets[tIdx], relatedProjectId: result.project.id };
      writeCollection("tickets", tickets);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

function toTicketView(ticket) {
  const employer = getUserById(ticket.employerId);
  const supervisor = getUserById(ticket.supervisorId);
  const freelancer = getUserById(ticket.freelancerId);
  // "party" is whichever counterpart is relevant to the panel viewing the
  // ticket - default to the freelancer, falling back to whoever's on it.
  const party = freelancer
    ? `${userDisplayName(freelancer)} | فریلنسر`
    : employer
      ? `${userDisplayName(employer)} | کارفرما`
      : supervisor
        ? `${userDisplayName(supervisor)} | ناظر`
        : "پشتیبانی";

  return {
    id: ticket.id,
    title: ticket.title,
    lastUpdate: ticket.lastUpdate,
    department: resolveDepartmentName(ticket.departmentId),
    party,
    freelancerName: userDisplayName(freelancer) || null,
    supervisorName: userDisplayName(supervisor) || null,
    priority: ticket.priority,
    status: TICKET_STATUS_LABELS[ticket.status] || ticket.status,
    // Drives which tab (current/archived) a ticket list groups it into.
    type: ticket.stage,
    // Drives whether the chat drawer shows the message composer or the
    // "this ticket is closed" notice - true for anything in the archive.
    isClosed: ticket.stage === "archived",
    relatedProjectId: ticket.relatedProjectId,
  };
}

export async function getTickets({ stage, employerId, supervisorId, freelancerId, query } = {}) {
  await delay();
  let tickets = readCollection("tickets");
  if (stage) tickets = tickets.filter((t) => t.stage === stage);
  if (employerId) tickets = tickets.filter((t) => t.employerId === employerId);
  if (supervisorId) tickets = tickets.filter((t) => t.supervisorId === supervisorId);
  if (freelancerId) tickets = tickets.filter((t) => t.freelancerId === freelancerId);

  const views = tickets.map(toTicketView);
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    return views.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.party.toLowerCase().includes(q),
    );
  }
  return views;
}

export async function getTicketById(id) {
  await delay(0);
  const ticket = byId(readCollection("tickets"), id);
  return ticket ? toTicketView(ticket) : null;
}

export async function getTicketMessages(ticketId) {
  await delay(0);
  const messages = readCollection("ticketMessages");
  return messages[ticketId] || [];
}

// TODO(API): POST /tickets/{id}/messages { text }
export async function sendTicketMessage({ ticketId, senderRole, senderId, text }) {
  await delay(150);
  const messages = readCollection("ticketMessages");
  const list = messages[ticketId] || [];
  const message = {
    id: `m-${Date.now()}`,
    senderRole,
    senderId,
    text,
    time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    createdAt: new Date().toISOString(),
  };
  messages[ticketId] = [...list, message];
  writeCollection("ticketMessages", messages);
  return { ok: true, message };
}

// TODO(API): POST /tickets
export async function createTicket(payload) {
  await delay(250);
  const tickets = readCollection("tickets");
  const newTicket = {
    id: `${Math.floor(1200000 + Math.random() * 90000)}AG`,
    title: payload.title,
    departmentId: resolveDepartmentId(payload.department),
    priority: payload.priority,
    status: "pending",
    stage: "current",
    relatedProjectId: null,
    employerId: payload.employerId || getCurrentUserId("employer"),
    supervisorId: payload.supervisorId || getCurrentUserId("supervisor"),
    freelancerId: payload.freelancerId || null,
    lastUpdate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  tickets.unshift(newTicket);
  writeCollection("tickets", tickets);
  return { ok: true, ticket: toTicketView(newTicket) };
}

// TODO(API): DELETE /tickets/{id}
export async function deleteTicket(id) {
  await delay(200);
  const tickets = readCollection("tickets").filter((t) => t.id !== id);
  writeCollection("tickets", tickets);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Tasks (freelancer task manager + employer reports kanban)
// ---------------------------------------------------------------------------

export async function getTasks({ freelancerId, columns } = {}) {
  await delay();
  let tasks = readCollection("tasks");
  if (freelancerId) tasks = tasks.filter((t) => t.freelancerId === freelancerId);
  if (columns) tasks = tasks.filter((t) => columns.includes(t.column));
  return tasks;
}

// Grouped + field-mapped for TaskManager/TaskCard, which expect
// snake_case field names (start_date/last_update) grouped by column.
export async function getTaskBoard({ freelancerId } = {}) {
  await delay();
  let tasks = readCollection("tasks");
  if (freelancerId) tasks = tasks.filter((t) => t.freelancerId === freelancerId);

  const toCardShape = (t) => ({
    id: t.id,
    title: t.title,
    department: t.department,
    start_date: t.startDate,
    last_update: t.lastUpdate,
    duration: t.duration,
    employerApproval: t.employerApproval,
    statusText: t.statusText,
    relatedTicketId: t.relatedTicketId,
  });

  return {
    deposited: tasks.filter((t) => t.column === "deposited").map(toCardShape),
    suggestions: tasks.filter((t) => t.column === "suggestions").map(toCardShape),
    completed: tasks.filter((t) => t.column === "completed").map(toCardShape),
  };
}

export async function getEmployerTaskReports({ employerId } = {}) {
  await delay();
  let tasks = readCollection("tasks");
  const projects = readCollection("projects");
  if (employerId) {
    const projectIds = new Set(
      projects.filter((p) => p.employerId === employerId).map((p) => p.id),
    );
    tasks = tasks.filter((t) => projectIds.has(t.projectId));
  }
  return {
    deposited: tasks.filter((t) => t.column === "deposited"),
    completed: tasks.filter((t) => t.column === "completed"),
  };
}

// ---------------------------------------------------------------------------
// Reports widget + revenue chart
// ---------------------------------------------------------------------------

export async function getReports() {
  await delay();
  return readCollection("reports");
}

export async function getRevenueByMonth() {
  await delay();
  return readCollection("revenueByMonth");
}

// ---------------------------------------------------------------------------
// Supervisor finance (per-project blocked/released transaction ledger)
// ---------------------------------------------------------------------------

export async function getFinanceStats() {
  await delay();
  return readCollection("financeStats");
}

export async function getFinanceProjects() {
  await delay();
  return readCollection("financeProjects");
}

// TODO(API): POST /finance/transactions/{id}/release - moves a blocked
// transaction to "paid" and unblocks the corresponding project funds.
export async function releaseFinanceTransaction({ financeProjectId, amount, freelancerName }) {
  await delay(250);
  const financeProjects = readCollection("financeProjects");
  const idx = financeProjects.findIndex((p) => p.id === financeProjectId);
  if (idx === -1) return { ok: false };

  const transaction = {
    id: `fin-${financeProjectId}-${Date.now()}`,
    amount: Number(amount) || 0,
    date: new Date().toLocaleDateString("fa-IR"),
    status: "پرداخت شد",
    target: freelancerName,
    state: "paid",
  };
  financeProjects[idx] = {
    ...financeProjects[idx],
    transactions: [...financeProjects[idx].transactions, transaction],
  };
  writeCollection("financeProjects", financeProjects);
  return { ok: true, transaction };
}

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

export async function getWallet(employerId) {
  await delay();
  const user = getUserById(employerId);
  return { balance: user?.walletBalance || 0 };
}

// TODO(API): POST /wallet/charge { amount } -> redirect to a payment gateway
export async function chargeWallet({ employerId, amount }) {
  await delay(300);
  const users = readCollection("users");
  const idx = users.findIndex((u) => u.id === employerId);
  if (idx === -1) return { ok: false };
  users[idx] = { ...users[idx], walletBalance: (users[idx].walletBalance || 0) + Number(amount || 0) };
  writeCollection("users", users);
  return { ok: true, balance: users[idx].walletBalance };
}

// TODO(API): POST /projects/{id}/payments/release { freelancerId, amount }
export async function releasePayment({ projectId, freelancerId, amount }) {
  await delay(300);
  const freelancer = getUserById(freelancerId);
  return await addProjectPayment({
    projectId,
    title: `آزادسازی وجه به ${userDisplayName(freelancer) || "فریلنسر"}`,
    amount,
  });
}
