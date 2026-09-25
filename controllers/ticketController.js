const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Ticket = require("../models/Ticket");
const Department = require("../models/Department");
const Supervisor = require("../models/Supervisor");
const TicketMessage = require("../models/TicketMessage");
const Project = require("../models/Project");
const User = require("../models/User");
const Freelancer = require("../models/Freelancer");
const Employer = require("../models/Employer");
const FinanceProject = require("../models/FinanceProject");
const Task = require("../models/Task");
const mongoose = require("mongoose");
const { resolveDepartmentName } = require("../utils/resolvers");
//convert ticket to project TODO api
// TODO(API): POST /tickets/{id}/convert - turns a ticket into a fully
// defined project, following the same createProject contract above
// (including optional isSuperProject/subProjects).
const convertTicketToProject = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found!");
  }

  // A ticket can only be converted once
  if (ticket.relatedProject) {
    throw new ApiError(
      409,
      "This ticket has already been converted to a project.",
    );
  }

  // ------------------------------------------
  // 2. Get data
  // ------------------------------------------

  const {
    title,
    description,
    departmentId,
    priority,
    proposalBudget,
    level,
    budget,
    deadline,
    supervisorId,
    isSuperProject,
    subProjects,
    briefFileUrl
  } = req.body;

  // ------------------------------------------
  // 3. Validate required data
  // ------------------------------------------

  const resolvedDeptId =
    departmentId && mongoose.isValidObjectId(departmentId)
      ? departmentId
      : ticket.department;

  if (
    isSuperProject &&
    (!Array.isArray(subProjects) || subProjects.length === 0)
  ) {
    throw new ApiError(
      400,
      "A super project must have at least one sub-project.",
    );
  }

  // ------------------------------------------
  // 4. Create normal project
  // ------------------------------------------

  if (!isSuperProject) {
    const project = await Project.create({
      title: title || ticket.title,

      description: description || ticket.description,

      departmentId: resolvedDeptId,

      priority,

      level: level || "c",

      budget: Number(budget) || 0,
      proposalBudget: Number(proposalBudget) || 0,
      paidAmount: 0,

      deadline,

      employerId: ticket.employer,

      supervisorId: req.user._id,

      freelancersId: [],

      stage: "open",

      status: "در حال بررسی",

      isSuperProject: false,

      subProjectsIds: [],

      progress: 0,

      ticketIds: [
        {
          ticketId: ticket._id,
          userId: ticket.userId,
        },
      ],

      payments: [],

      reviews: [],
      ...(briefFileUrl ? { briefFileUrl } : {})
    });
    await Task.create({
      projectId : project._id,
      employerId : project.employerId,
      column : "deposited",
      title : project.title,
      department : await resolveDepartmentName(project.departmentId),
      startDate : new Date(),
      relatedTicketId : ticket._id,
      employerApproval : "under review",
      approvalStatus : "under review",
      statusText : "open",
      settlementStatus : "Awaiting"
        });
    await FinanceProject.create({
      projectId : project._id,
      title : project.title,
      totalAmount : project.budget,
      blockedAmount : 0,
      statusType : "بلاک"
        });
    await Supervisor.findOneAndUpdate(
      { userId: project.supervisorId },
      {
        $addToSet: {
          projects: project._id,
        },
      },
      { new: true },
    );

    await Employer.findOneAndUpdate(
      { userId: project.employerId },
      {
        $addToSet: {
          projects: project._id,
        },
      },
      { new: true },
    );
    // ------------------------------------------
    // 5. Connect ticket to project
    // ------------------------------------------

    ticket.relatedProject = project._id;
    ticket.supervisor = project.supervisorId;

    await ticket.save();
    await Department.findByIdAndUpdate(project.departmentId, {
      $addToSet: {
        projects: project._id,
        employers: project.employerId,
        supervisors: project.supervisorId,
      },
    });

    return res.status(201).json({
      ok: true,
      project,
      ticket,
    });
  }

  // ==========================================
  // SUPER PROJECT
  // ==========================================

  // ------------------------------------------
  // 6. Create sub-projects
  // ------------------------------------------

  const subProjectIds = [];

  for (const subProject of subProjects) {
    const newSubProject = await Project.create({
      title: subProject.title,
      
      description: subProject.description || description || ticket.description,

      departmentId:
        (subProject.departmentId && mongoose.isValidObjectId(subProject.departmentId))
          ? subProject.departmentId
          : resolvedDeptId,

      priority: subProject.priority || priority,

      level: subProject.level || level || "c",

      budget: Number(subProject.budget) || 0,
      proposalBudget:
        Number(subProject.proposalBudget) ||
        Number(subProject.budget) ||
        Number(proposalBudget) ||
        0,

      paidAmount: 0,

      deadline: subProject.deadline || deadline,

      employerId: ticket.employer,

      supervisorId: supervisorId || ticket.supervisor,

      freelancersId: [],

      stage: "active",

      status: "در حال بررسی",

      isSuperProject: false,

      subProjectsIds: [],

      progress: 0,

      ticketIds: [],

      payments: [],

      reviews: [],
      ...(subProject.briefFileUrl
      ? { briefFileUrl: subProject.briefFileUrl }
      : briefFileUrl
        ? { briefFileUrl }
        : {})
   
    });
    await FinanceProject.create({
        projectId : newSubProject._id,
        title : newSubProject.title,
        totalAmount : newSubProject.budget,
        blockedAmount : 0,
        statusType : "بلاک"
          });
    subProjectIds.push(newSubProject._id);
  }

  // ------------------------------------------
  // 7. Create super project
  // ------------------------------------------

  const superProject = await Project.create({
    title: title || ticket.title,

    description: description || ticket.description,

    departmentId: resolvedDeptId,

    priority,

    level: level || "c",

    budget: Number(budget) || 0,
    proposalBudget: Number(proposalBudget) || 0,
    paidAmount: 0,

    deadline,
    
    employerId: ticket.employer,

    supervisorId: supervisorId || ticket.supervisor,

    freelancersId: [],

    stage: "open",

    status: "در حال بررسی",

    isSuperProject: true,

    subProjectsIds: subProjectIds,

    progress: 0,

    ticketIds: [
      {
        ticketId: ticket._id,
        userId: ticket.userId,
      },
    ],

    payments: [],

    reviews: [],
     ...(briefFileUrl ? { briefFileUrl } : {})
  });
  await Task.create({
    projectId : superProject._id,
    employerId : superProject.employerId,
    column : "deposited",
    title : superProject.title,
    department : await resolveDepartmentName(superProject.departmentId),
    startDate : new Date(),
    relatedTicketId : ticket._id,
    employerApproval : "under review",
    approvalStatus : "under review",
    statusText : "open",
    settlementStatus : "Awaiting"
        });

  await FinanceProject.create({
        projectId : superProject._id,
        title : superProject.title,
        totalAmount : superProject.budget,
        blockedAmount : 0,
        statusType : "بلاک"
          });

  await Supervisor.findOneAndUpdate(
    { userId: superProject.supervisorId },
    {
      $addToSet: {
        projects: superProject._id,
      },
    },
  );

  await Employer.findOneAndUpdate(
    { userId: superProject.employerId },
    {
      $addToSet: {
        projects: superProject._id,
      },
    },
  );
  // ------------------------------------------
  // 8. Connect ticket to super project
  // ------------------------------------------

  ticket.relatedProject = superProject._id;
  ticket.supervisor = superProject.supervisorId;
    
  await ticket.save();

  // ------------------------------------------
  // 9. Response
  // ------------------------------------------
  await Department.findByIdAndUpdate(superProject.departmentId, {
    $addToSet: {
      projects: superProject._id,
      employers: superProject.employerId,
      supervisors: superProject.supervisorId,
    },
  });

  res.status(201).json({
    ok: true,
    project: superProject,
    subProjects: subProjectIds,
    ticket,
  });
});

const createTicket = asyncHandler(async (req, res) => {
  const myDepartment = await Department.findOne({
    name: req.body.department,
  });

  if (!myDepartment) {
    throw new ApiError(404, "Department not found!");
  }

  const ticketData = {
    ...req.body,
    department: myDepartment._id,
    userId: req.user._id,
  };

  // Put the current user's ID in the appropriate field
  if (req.user.role === "employer") {
    ticketData.employer = req.user._id;
  } else if (req.user.role === "supervisor") {
    ticketData.supervisor = req.user._id;
  } else if (req.user.role === "freelancer") {
    ticketData.freelancer = req.user._id;
  }

  const newTicket = await Ticket.create(ticketData);

  res.status(201).json(newTicket);
});

const getTickets = asyncHandler(async (req, res) => {
  const { stage, employer, supervisor, freelancer, query } = req.query;

  const filter = {};

  // =========================
  // ACCESS CONTROL
  // =========================
  console.log("imma here bitch" , req.user.role);
    
  if (req.user.role === "admin") {
    // Admin can see all tickets
  } else if (
    req.user.role === "freelancer" ||
    req.user.role === "employer" ||
    req.user.role === "user"
  ) {
    // Freelancer / Employer can only see
    // tickets created by themselves
    filter.userId = req.user._id;
  } else if (req.user.role === "supervisor") {
    const supervisorUser = await Supervisor.findOne({
      userId: req.user._id,
    });
    
    if (!supervisorUser) {
      throw new ApiError(403, "Supervisor profile not found");
    }

    // Supervisor stores department NAMES
    // Ticket stores department OBJECT IDs

    const departments = await Department.find({
      name: {
        $in: supervisorUser.departments,
      },
    }).select("_id");

    const departmentIds = departments.map((department) => department._id);

    filter.department = {
      $in: departmentIds,
    };
  } else {
    throw new ApiError(403, "You are not authorized to view tickets");
  }

  // =========================
  // FILTERS
  // =========================

  if (stage) {
    filter.stage = stage;
  }

  // These filters should only be usable by admin
  if (req.user.role === "admin") {
    if (employer) {
      filter.employer = employer;
    }

    if (supervisor) {
      filter.supervisor = supervisor;
    }

    if (freelancer) {
      filter.freelancer = freelancer;
    }
  }

  // =========================
  // SEARCH
  // =========================

  if (query && query.trim()) {
    const q = query.trim();

    filter.$or = [
      {
        title: {
          $regex: q,
          $options: "i",
        },
      },
      {
        description: {
          $regex: q,
          $options: "i",
        },
      },
    ];
  }

  // =========================
  // DATABASE QUERY
  // =========================
  
  const tickets = await Ticket.find(filter);

  res.status(200).json({
    count: tickets.length,
    tickets,
  });
});

const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const isOwner = ticket.userId.equals(req.user._id);
  const isAdmin = req.user.role === "admin";

  let isSupervisorOfDepartment = false;

  if (req.user.role === "supervisor") {
    const supervisorUser = await Supervisor.findOne({
      userId: req.user._id,
    });

    if (!supervisorUser) {
      throw new ApiError(403, "Supervisor profile not found");
    }

    const departments = await Department.find({
      name: {
        $in: supervisorUser.departments,
      },
    }).select("_id");

    isSupervisorOfDepartment = departments.some((department) =>
      department._id.equals(ticket.department),
    );
  }

  if (!isOwner && !isAdmin && !isSupervisorOfDepartment) {
    throw new ApiError(403, "You're not authorized");
  }

  res.status(200).json(ticket);
});

const getTicketMessages = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate(
    "relatedProject",
    "supervisorId",
  );

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // Ticket owner
  const isOwner = ticket.userId.equals(req.user._id);

  // Admin
  const isAdmin = req.user.role === "admin";

  // Supervisor of the related project
  let isProjectSupervisor = false;

  if (ticket.relatedProject?.supervisorId) {
    isProjectSupervisor = ticket.relatedProject.supervisorId.equals(
      req.user._id,
    );
  }

  // Supervisor of the ticket's department
  let isSupervisorOfDepartment = false;

  if (req.user.role === "supervisor") {
    const supervisorUser = await Supervisor.findOne({
      userId: req.user._id,
    });

    if (!supervisorUser) {
      throw new ApiError(403, "Supervisor profile not found");
    }

    const departments = await Department.find({
      name: {
        $in: supervisorUser.departments,
      },
    }).select("_id");

    isSupervisorOfDepartment = departments.some((department) =>
      department._id.equals(ticket.department),
    );

    if (ticket.relatedProject?.supervisorId) {
      if (!ticket.relatedProject.supervisorId.equals(req.user._id)) {
        isSupervisorOfDepartment = false;
      }
    }
  }

  // Authorization
  if (
    !isOwner &&
    !isAdmin &&
    !isProjectSupervisor &&
    !isSupervisorOfDepartment
  ) {
    throw new ApiError(403, "You're not authorized");
  }

  const ticketMessages = await TicketMessage.find({
    ticket: ticket._id,
  });

  res.status(200).json(ticketMessages);
});

const canSupervisorManageTicket = async (userId, ticket) => {
  const supervisor = await Supervisor.findOne({ userId });

  if (!supervisor) {
    throw new ApiError(403, "Supervisor profile not found");
  }

  const departments = await Department.find({
    name: { $in: supervisor.departments },
  }).select("_id");

  return departments.some((d) => d._id.equals(ticket.department));
};
// check it
const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  if (req.user.role === "supervisor") {
    const allowed = await canSupervisorManageTicket(req.user._id, ticket);

    if (!allowed) {
      throw new ApiError(403, "You're not authorized");
    }
    if (ticket.supervisor) {
      const isSupervisorOfThisProject = ticket.supervisor.equals(req.user._id);
      if (!isSupervisorOfThisProject) {
        throw new ApiError(
          403,
          "You can't delete someone else's project ticket",
        );
      }
    }
  }

  await ticket.deleteOne();

  res.status(200).json({ message: "Ticket deleted successfully" });
});
// check it
const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  if (req.user.role === "supervisor") {
    const allowed = await canSupervisorManageTicket(req.user._id, ticket);

    if (!allowed) {
      throw new ApiError(403, "You're not authorized");
    }
  }

  Object.assign(ticket, req.body);
  await ticket.save();

  res.status(200).json(ticket);
});

const verifyFreelancer = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // Only supervisor/admin should reach this endpoint
  if (req.user.role === "supervisor") {
    const allowed = await canSupervisorManageTicket(req.user._id, ticket);

    if (!allowed) {
      throw new ApiError(403, "You're not authorized");
    }
  }

  if (!ticket.freelancer) {
    throw new ApiError(
      400,
      "This ticket is not a freelancer verification ticket.",
    );
  }

  // ------------------------------------------
  // UPDATE USER
  // ------------------------------------------

  const userUpdates = {};

  if (req.body.skills !== undefined) {
    userUpdates.skills = req.body.skills;
  }

  const user = await User.findByIdAndUpdate(
    ticket.freelancer,
    { $set: userUpdates },
    { new: true },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // ------------------------------------------
  // UPDATE FREELANCER
  // ------------------------------------------

  const freelancerUpdates = {};

  if (req.body.level !== undefined) {
    freelancerUpdates.level = req.body.level;
  }

  if (req.body.availableForProposals !== undefined) {
    freelancerUpdates.availableForProposals = req.body.availableForProposals;
  }

  const freelancer = await Freelancer.findOneAndUpdate(
    { userId: ticket.freelancer },
    { $set: freelancerUpdates },
    { new: true },
  );

  if (!freelancer) {
    throw new ApiError(404, "Freelancer profile not found");
  }
  const authDepartment = await Department.findOne({
    name: "احراز هویت",
  });

  if (authDepartment) {
    authDepartment.freelancers.pull(ticket.freelancer);
    await authDepartment.save();
  }
  res.status(200).json({
    message: "Freelancer verified successfully!",
    user,
    freelancer,
  });
});
module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  deleteTicket,
  updateTicket,
  convertTicketToProject,
  getTicketMessages,
  verifyFreelancer,
};
