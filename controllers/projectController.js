const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Department = require("../models/Department");
const Supervisor = require("../models/Supervisor");
const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const Freelancer = require("../models/Freelancer");
const Employer = require("../models/Employer");
const TicketMessage = require("../models/TicketMessage");
const Ticket = require("../models/Ticket");
const Notifications = require("../models/Notifications");
const { resolveDepartmentName } = require("../utils/resolvers");
const User = require("../models/User");
const FinanceProject = require("../models/FinanceProject");
const Task = require("../models/Task");

const enrichProjectFreelancers = async (projects) => {
  const projectList = Array.isArray(projects) ? projects : [projects];

  // Convert Mongoose documents to plain objects
  const projectObjects = projectList.map((project) =>
    project.toObject ? project.toObject() : project
  );

  // Get all freelancer User IDs from all projects
  const freelancerUserIds = [
    ...new Set(
      projectObjects
        .flatMap((project) => project.freelancersId || [])
        .map((user) => user?._id?.toString() || user?.toString())
        .filter(Boolean)
    ),
  ];

  if (freelancerUserIds.length === 0) {
    return projectObjects;
  }

  // Get Freelancer profiles in ONE query
  const freelancerProfiles = await Freelancer.find({
    userId: { $in: freelancerUserIds },
  })
    .select("userId level rateScore")
    .lean();

  // Create a map:
  // User ID -> Freelancer profile
  const freelancerMap = new Map(
    freelancerProfiles.map((freelancer) => [
      freelancer.userId.toString(),
      freelancer,
    ])
  );

  // Add Freelancer information to each User
  for (const project of projectObjects) {
    project.freelancersId = (project.freelancersId || []).map((user) => {
      const userId = user?._id?.toString() || user?.toString();

      const freelancer = freelancerMap.get(userId);

      // If User was populated
      if (user && typeof user === "object" && user._id) {
        return {
          ...user,
          level: freelancer?.level ?? null,
          rateScore: freelancer?.rateScore ?? null,
        };
      }

      // If User wasn't populated
      return {
        _id: user,
        level: freelancer?.level ?? null,
        rateScore: freelancer?.rateScore ?? null,
      };
    });
  }

  return projectObjects;
};
// only supervisor and admin role can do this
const assignFreelancer = asyncHandler(async (req, res) => {
  const { freelancerId } = req.body;
  const { id: projectId } = req.params;

  // ------------------------------------------
  // VALIDATE freelancerId
  // ------------------------------------------

  if (!freelancerId) {
    throw new ApiError(400, "freelancerId is required");
  }

  // ------------------------------------------
  // FIND PROJECT
  // ------------------------------------------

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // ------------------------------------------
  // CHECK FREELANCER
  // ------------------------------------------

  const freelancer = await User.findOne({
    _id: freelancerId,
    role: "freelancer",
  });

  if (!freelancer) {
    throw new ApiError(404, "Freelancer not found");
  }

  // ------------------------------------------
  // CHECK IF ALREADY ASSIGNED
  // ------------------------------------------

  const alreadyAssigned = project.freelancersId.some((id) =>
    id.equals(freelancerId),
  );

  if (alreadyAssigned) {
    throw new ApiError(400, "Freelancer is already assigned to this project");
  }

  // ------------------------------------------
  // FIND OR CREATE PROPOSAL
  // ------------------------------------------

  let proposal = await Proposal.findOne({
    projectId: project._id,
    freelancerId,
  });

  const proposedCost =
    req.body.proposedCost ?? proposal?.proposedCost ?? project.proposalBudget;

  if (proposedCost == null) {
    throw new ApiError(400, "proposedCost is required");
  }

  if (proposal) {
    // Existing proposal
    proposal.status = "accepted";
    proposal.proposedCost = proposedCost;
    proposal.note = "This freelancer has been assigned to this project!";

    await proposal.save();
  } else {
    // No proposal → create one
    proposal = await Proposal.create({
      projectId: project._id,
      freelancerId,
      status: "accepted",
      proposedCost,
      note: "This freelancer has been assigned to this project!",
    });
  }

  // ------------------------------------------
  // CREATE TICKET
  // ------------------------------------------

  const newTicket = await Ticket.create({
    title: "تیکت " + project.title,
    description:
      "its a project ticket between you and supervisor of this project",
    department: project.departmentId,
    userId: freelancerId,
    priority: "کم",
    relatedProject: project._id,
    freelancer: freelancerId,
    supervisor: project.supervisorId,
    employer: project.employerId,
  });

  await Task.create({
    projectId: project._id,
    freelancerId: freelancerId,
    column: "deposited",
    title: project.title,
    department: await resolveDepartmentName(project.departmentId),
    startDate: new Date(),
    relatedTicketId: newTicket._id,
    employerApproval: "under review",
    statusText: "active",
    approvalStatus: "under review",
    settlementStatus: "Awaiting",
  });
  // ------------------------------------------
  // UPDATE PROJECT
  // ------------------------------------------

  project.ticketIds.push({
    ticketId: newTicket._id,
    userId: freelancerId,
  });

  project.freelancersId.push(freelancerId);

  project.status = "در حال انجام";
  await Department.findByIdAndUpdate(project.departmentId, {
    $addToSet: {
      freelancers: freelancerId,
    },
  });
  await Freelancer.findOneAndUpdate(
    { userId: freelancerId },
    {
      $addToSet: {
        projects: project._id,
      },
    },
  );

  await project.save();

  // ------------------------------------------
  // RESPONSE
  // ------------------------------------------

  res.status(200).json({
    ok: true,
    project,
  });
});

const addProjectReview = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;
  const { rating, comment } = req.body;

  // ------------------------------------------
  // FIND PROJECT
  // ------------------------------------------

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // ------------------------------------------
  // PROJECT MUST BE COMPLETED
  // ------------------------------------------

  if (project.stage !== "completed") {
    throw new ApiError(400, "You can only review a completed project");
  }

  // ------------------------------------------
  // DETERMINE REVIEWER
  // ------------------------------------------

  let role;

  if (project.employerId.equals(req.user._id)) {
    role = "employer";
  } else if (project.supervisorId.equals(req.user._id)) {
    role = "supervisor";
  } else if (req.user.role === "admin") {
    role = "admin";
  } else {
    throw new ApiError(
      403,
      "Only the employer or supervisor can review this project",
    );
  }

  // ------------------------------------------
  // PREVENT DUPLICATE REVIEW
  // ------------------------------------------

  const alreadyReviewed = project.reviews.some(
    (review) => review.role === role,
  );

  if (alreadyReviewed) {
    throw new ApiError(400, `The ${role} has already reviewed this project`);
  }

  // ------------------------------------------
  // GET RATER
  // ------------------------------------------

  const rater = await User.findById(req.user._id);

  if (!rater) {
    throw new ApiError(404, "User not found");
  }

  // ------------------------------------------
  // CREATE REVIEW
  // ------------------------------------------

  project.reviews.push({
    role,
    raterName: rater.displayName || (role === "employer" ? "کارفرما" : "ناظر"),

    initial: rater.initial || (role === "employer" ? "A" : "M"),

    stars: rating,
    text: comment,
  });

  // ------------------------------------------
  // CALCULATE PROJECT RATING this formula is important bring it in documention of this project
  // ------------------------------------------

  const employerReview = project.reviews.find(
    (review) => review.role === "employer",
  );

  const supervisorReview = project.reviews.find(
    (review) => review.role === "supervisor",
  );

  let projectRating;

  if (employerReview && supervisorReview) {
    projectRating = (employerReview.stars + supervisorReview.stars) / 2;
  } else if (employerReview) {
    projectRating = employerReview.stars;
  } else if (supervisorReview) {
    projectRating = supervisorReview.stars;
  }

  // ------------------------------------------
  // UPDATE FREELANCERS' RATING
  // ------------------------------------------

  /*
   * IMPORTANT:
   *
   * If both reviews don't exist yet, we still update
   * the freelancer's rating using the review that exists.
   *
   * But when the second review is submitted, we need
   * to recalculate the freelancer's overall rating.
   */

  const freelancers = await Freelancer.find({
    userId: {
      $in: project.freelancersId,
    },
  });

  for (const freelancer of freelancers) {
    /*
     * Get all completed projects of this freelancer
     * that have at least one review.
     */
    const completedProjects = await Project.find({
      stage: "completed",
      freelancersId: freelancer.userId,
      reviews: {
        $elemMatch: {
          role: {
            $in: ["employer", "supervisor"],
          },
        },
      },
    }).select("reviews");

    let totalRating = 0;
    let projectCount = 0;

    for (const completedProject of completedProjects) {
      const employerReview = completedProject.reviews.find(
        (review) => review.role === "employer",
      );

      const supervisorReview = completedProject.reviews.find(
        (review) => review.role === "supervisor",
      );

      let projectRating;

      if (employerReview && supervisorReview) {
        projectRating = (employerReview.stars + supervisorReview.stars) / 2;
      } else if (employerReview) {
        projectRating = employerReview.stars;
      } else if (supervisorReview) {
        projectRating = supervisorReview.stars;
      }

      if (projectRating !== undefined) {
        totalRating += projectRating;
        projectCount++;
      }
    }

    freelancer.rateScore = projectCount > 0 ? totalRating / projectCount : 0;

    await freelancer.save();
  }

  // ------------------------------------------
  // SAVE PROJECT
  // ------------------------------------------

  await project.save();

  // ------------------------------------------
  // RESPONSE
  // ------------------------------------------

  const createdReview = project.reviews[project.reviews.length - 1];

  res.status(201).json({
    ok: true,
    review: createdReview,
    projectRating,
  });
});

// TODO(API): PATCH /projects/{id}/price { newPrice } - the supervisor/admin
// "edit freelancer cost" action from inside the ticket chat.
const editProjectPrice = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;
  const { freelancerId, newPrice } = req.body;

  // ------------------------------------------
  // FIND PROJECT
  // ------------------------------------------

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // ------------------------------------------
  // SUPERVISOR CAN ONLY EDIT THEIR OWN PROJECT
  // ADMIN CAN EDIT ANY PROJECT
  // ------------------------------------------

  if (req.user.role === "supervisor") {
    if (!project.supervisorId.equals(req.user._id)) {
      throw new ApiError(
        403,
        "You can't edit the price of another supervisor's project",
      );
    }
  }

  // ------------------------------------------
  // FIND FREELANCER PROPOSAL
  // ------------------------------------------

  const proposal = await Proposal.findOne({
    projectId: project._id,
    freelancerId,
  });

  if (!proposal) {
    throw new ApiError(404, "Proposal for this freelancer was not found");
  }

  // ------------------------------------------
  // UPDATE PROPOSED COST
  // ------------------------------------------

  proposal.proposedCost = newPrice;

  await proposal.save();

  // ------------------------------------------
  // RESPONSE
  // ------------------------------------------

  res.status(200).json({
    ok: true,
    proposal,
  });
});

//authrize("super" , "admin")
const createProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    department,
    priority,
    level,
    budget,
    proposalBudget,
    deadline,
    editCount,
    employerId,
    supervisorId,
    isSuperProject = false,
    subProjects = [],
  } = req.body;

  // ==========================================
  // 2. VALIDATE REQUIRED DATA
  // ==========================================

  if (!title || !title.trim()) {
    throw new ApiError(400, "Project title is required");
  }

  if (!description || !description.trim()) {
    throw new ApiError(400, "Project description is required");
  }

  if (!department) {
    throw new ApiError(400, "Department is required");
  }

  if (
    budget === undefined ||
    Number.isNaN(Number(budget)) ||
    Number(budget) < 0
  ) {
    throw new ApiError(400, "Valid budget is required");
  }

  if (!deadline) {
    throw new ApiError(400, "Deadline is required");
  }

  if (!employerId) {
    throw new ApiError(400, "Employer is required");
  }

  // ==========================================
  // 3. FIND DEPARTMENT
  // ==========================================

  const myDepartment = await Department.findOne({
    name: department,
  }).select("_id");

  if (!myDepartment) {
    throw new ApiError(404, "Department not found");
  }

  // ==========================================
  // 4. DETERMINE SUPERVISOR
  // ==========================================

  let projectSupervisorId;

  if (req.user.role === "supervisor") {
    // ------------------------------------------
    // Supervisor creates the project
    // ------------------------------------------

    const supervisor = await Supervisor.findOne({
      userId: req.user._id,
    });

    if (!supervisor) {
      throw new ApiError(403, "Supervisor profile not found");
    }

    // Supervisor can ONLY create in their departments
    if (!supervisor.departments.includes(department)) {
      throw new ApiError(
        403,
        "You are not authorized to create a project in this department",
      );
    }

    // The supervisor creating the project
    // automatically becomes its supervisor
    projectSupervisorId = req.user._id;
  } else if (req.user.role === "admin") {
    // ------------------------------------------
    // Admin creates the project
    // ------------------------------------------

    if (!supervisorId) {
      throw new ApiError(
        400,
        "Supervisor is required when admin creates a project",
      );
    }

    // Make sure selected user actually has
    // a Supervisor profile
    const selectedSupervisor = await Supervisor.findOne({
      userId: supervisorId,
    });

    if (!selectedSupervisor) {
      throw new ApiError(400, "Selected supervisor does not exist");
    }

    projectSupervisorId = supervisorId;
  }

  // ==========================================
  // 5. BASE PROJECT
  // ==========================================

  const baseProject = {
    title: title.trim(),
    description: description.trim(),

    departmentId: myDepartment._id,

    priority,
    level: level || "c",

    budget: Number(budget),
    proposalBudget: proposalBudget,
    paidAmount: 0,

    deadline,

    // Required at creation
    employerId,

    // Determined by backend
    supervisorId: projectSupervisorId,

    freelancersId: [],

    stage: "open",
    status: null,

    progress: 0,
    editCount: Number(editCount) || 1,

    ticketIds: [],

    payments: [],
    reviews: [],
  };

  // ==========================================
  // 6. SUPER PROJECT
  // ==========================================

  if (isSuperProject === true) {
    if (!Array.isArray(subProjects) || subProjects.length === 0) {
      throw new ApiError(
        400,
        "Super project must contain at least one sub-project",
      );
    }

    // Create parent project
    const superProject = await Project.create({
      ...baseProject,

      isSuperProject: true,

      subProjectsIds: [],

      stage: "open",
      status: null,
    });

    await Task.create({
      projectId: superProject._id,
      employerId: superProject.employerId,
      column: "deposited",
      title: superProject.title,
      department: await resolveDepartmentName(superProject.departmentId),
      startDate: new Date(),
      employerApproval: "under review",
      approvalStatus: "under review",
      statusText: "open",
      settlementStatus: "Awaiting",
    });
    await FinanceProject.create({
      projectId: superProject._id,
      title: superProject.title,
      totalAmount: superProject.budget,
      blockedAmount: 0,
      statusType: "بلاک",
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
    // Create child projects
    const createdSubProjects = [];

    for (const sub of subProjects) {
      if (!sub.title || !sub.title.trim()) {
        throw new ApiError(400, "Every sub-project must have a title");
      }

      if (
        sub.budget === undefined ||
        Number.isNaN(Number(sub.budget)) ||
        Number(sub.budget) < 0
      ) {
        throw new ApiError(
          400,
          `Invalid budget for sub-project "${sub.title}"`,
        );
      }

      const subProject = await Project.create({
        ...baseProject,

        title: sub.title.trim(),

        budget: Number(sub.budget),
        proposalBudget:
          Number(sub.proposalBudget) || Number(proposalBudget) || 0,
        deadline: sub.deadline || deadline,

        isSuperProject: false,

        subProjectsIds: [],

        stage: "active",
        status: "در حال بررسی",

        progress: 0,
        editCount: sub.editCount || editCount || 1,
      });
      await FinanceProject.create({
        projectId: subProject._id,
        title: subProject.title,
        totalAmount: subProject.budget,
        blockedAmount: 0,
        statusType: "بلاک",
      });

      createdSubProjects.push(subProject);
    }

    // Link children to parent
    superProject.subProjectsIds = createdSubProjects.map(
      (project) => project._id,
    );

    await superProject.save();
    await Department.findByIdAndUpdate(myDepartment._id, {
      $addToSet: {
        projects: superProject._id,
        employers: superProject.employerId,
        supervisors: superProject.supervisorId,
      },
    });

    return res.status(201).json({
      ok: true,
      project: superProject,
      subProjects: createdSubProjects,
    });
  }

  // ==========================================
  // 7. NORMAL PROJECT
  // ==========================================

  const project = await Project.create({
    ...baseProject,

    isSuperProject: false,

    subProjectsIds: [],
  });
  await Task.create({
    projectId: project._id,
    employerId: project.employerId,
    column: "deposited",
    title: project.title,
    department: await resolveDepartmentName(project.departmentId),
    startDate: new Date(),
    employerApproval: "under review",
    approvalStatus: "under review",
    statusText: "open",
    settlementStatus: "Awaiting",
  });
  await FinanceProject.create({
    projectId: project._id,
    title: project.title,
    totalAmount: project.budget,
    blockedAmount: 0,
    statusType: "بلاک",
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
  await Department.findByIdAndUpdate(myDepartment._id, {
    $addToSet: {
      projects: project._id,
      employers: project.employerId,
      supervisors: project.supervisorId,
    },
  });
  res.status(201).json({
    ok: true,
    project,
  });
});

const getProjects = asyncHandler(async (req, res) => {
  const { stage, employerId, supervisorId, freelancerId, query } = req.query;

  const filter = {};

  // ==================================================
  // 1. ACCESS CONTROL
  // ==================================================

  // ------------------------------------------
  // ADMIN
  // Can see everything
  // ------------------------------------------

  if (req.user.role === "admin") {
    // Admin can optionally filter
    if (stage) {
      filter.stage = stage;
    }

    if (employerId) {
      filter.employerId = employerId;
    }

    if (supervisorId) {
      filter.supervisorId = supervisorId;
    }

    if (freelancerId) {
      filter.freelancersId = freelancerId;
    }
  }

  // ------------------------------------------
  // EMPLOYER
  // Can ONLY see their own projects
  // ------------------------------------------
  else if (req.user.role === "employer") {
    filter.employerId = req.user._id;

    if (stage) {
      filter.stage = stage;
    }
  }

  // ------------------------------------------
  // SUPERVISOR
  // Can see projects in their departments
  // ------------------------------------------
  else if (req.user.role === "supervisor") {
    const supervisor = await Supervisor.findOne({
      userId: req.user._id,
    });

    if (!supervisor) {
      throw new ApiError(403, "Supervisor profile not found");
    }

    // Convert department names:
    // ["IT", "Finance"]
    //
    // into department ObjectIds
    const departments = await Department.find({
      name: {
        $in: supervisor.departments,
      },
    }).select("_id");

    const departmentIds = departments.map((department) => department._id);

    filter.departmentId = {
      $in: departmentIds,
    };

    if (stage) {
      filter.stage = stage;
    }

    // Optional: supervisor-specific filter
    if (supervisorId) {
      filter.supervisorId = supervisorId;
    }
  }

  // ------------------------------------------
  // FREELANCER
  // Open projects are visible to everyone .
  // they can see all of the projects that their stages are open not active /completed
  // they can see all of active and completed project that they are choosed for them
  // only when assigned to this freelancer.

  // if we were freelancer we should not able to see budget if it was open project we must see proposalBudget instead of budget. and if the project stage was active or completed we must see its proposal proposedCost instead of budget

  // ------------------------------------------
  else if (req.user.role === "freelancer") {
    if (stage === "open") {
      filter.stage = "open";
    } else if (stage === "active" || stage === "completed") {
      filter.stage = stage;
      filter.freelancersId = req.user._id;
    } else {
      filter.$or = [
        { stage: "open" },
        {
          stage: { $in: ["active", "completed"] },
          freelancersId: req.user._id,
        },
      ];
    }
  }

  // ------------------------------------------
  // UNKNOWN ROLE
  // ------------------------------------------
  else {
    throw new ApiError(403, "You are not authorized to view projects");
  }

  // ==================================================
  // 2. SEARCH
  // ==================================================

  if (query && query.trim()) {
    const q = query.trim();

    /*
     * Because departmentId, supervisorId and employerId
     * are ObjectIds, we cannot directly do:
     *
     * { departmentId: { $regex: q } }
     *
     * Instead we search the referenced collections first.
     */

    const searchRegex = new RegExp(q, "i");

    const [departments, users] = await Promise.all([
      Department.find({
        name: searchRegex,
      }).select("_id"),

      // Search users by first name, last name or username
      require("../models/User")
        .find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { username: searchRegex },
          ],
        })
        .select("_id"),
    ]);

    const departmentIds = departments.map((department) => department._id);

    const userIds = users.map((user) => user._id);

    const searchCondition = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        {
          departmentId: {
            $in: departmentIds,
          },
        },
        {
          employerId: {
            $in: userIds,
          },
        },
        {
          supervisorId: {
            $in: userIds,
          },
        },
        {
          freelancersId: {
            $in: userIds,
          },
        },
      ],
    };

    /*
     * If we already have an access filter such as:
     *
     * employerId = current user's ID
     *
     * we need BOTH conditions:
     *
     * access condition AND search condition
     */

    const existingFilter = { ...filter };

    // Remove $or temporarily if freelancer
    const existingOr = existingFilter.$or;
    delete existingFilter.$or;

    if (existingOr) {
      filter.$and = [
        existingFilter,
        {
          $or: existingOr,
        },
        searchCondition,
      ];
    } else {
      filter.$and = [existingFilter, searchCondition];
    }
  }

  // ==================================================
  // 3. GET PROJECTS
  // ==================================================
  const projects = await Project.find(filter)
    .populate("departmentId", "name")
    .populate("employerId", "firstName lastName username")
    .populate("supervisorId", "firstName lastName username")
    .populate("freelancersId", "firstName lastName username")
    .populate("ticketIds.ticketId")
    .populate("ticketIds.userId", "firstName lastName username")
    .populate("subProjectsIds");
  let result = await enrichProjectFreelancers(projects);

  if (req.user.role === "freelancer") {
    // check out this line i have added this
    const user = await User.findById(req.user._id).select("skills").lean();
    if (!user) {
      throw new ApiError(404, "User not found! for cheching its skils");
    }

    result = result.filter(
      (project) =>
        project.departmentId &&
        user.skills?.includes(project.departmentId.name),
    );

    result = await Promise.all(
      result.map(async (project) => {
        // ------------------------------------------
        // OPEN PROJECT
        // Freelancer sees proposalBudget instead
        // of the real budget
        // ------------------------------------------
        if (project.stage === "open") {
          const projectData = project.toObject();

          delete projectData.budget;

          return {
            ...projectData,
            proposalBudget: project.proposalBudget,
          };
        }
        // ------------------------------------------
        // ACTIVE / COMPLETED PROJECT
        // Freelancer sees his proposedCost
        // ------------------------------------------
        const proposal = await Proposal.findOne({
          projectId: project._id,
          freelancerId: req.user._id,
          status: "accepted",
        }).select("proposedCost");

        const projectData = project.toObject();

        delete projectData.budget;

        return {
          ...projectData,
          proposedCost: proposal?.proposedCost ?? null,
        };
      }),
    );
  }

  // ==================================================
  // 4. RESPONSE
  // ==================================================

  res.status(200).json({
    count: result.length,
    projects: result,
  });
});

const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate("departmentId", "name")
    .populate("employerId", "firstName lastName username")
    .populate("supervisorId", "firstName lastName username")
    .populate(
      "freelancersId",
      "firstName lastName username"
    )
    .populate("ticketIds.ticketId")
    .populate(
      "ticketIds.userId",
      "firstName lastName username"
    )
    .populate("subProjectsIds");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Enrich freelancers with level + rateScore
  const enrichedProjects = await enrichProjectFreelancers(project);
  let result = enrichedProjects[0];

  // ==================================================
  // EMPLOYER
  // ==================================================

  if (req.user.role === "employer") {
    if (
      !project.employerId?._id?.equals(req.user._id)
    ) {
      throw new ApiError(
        403,
        "You can't access here dude!"
      );
    }

    const {
      freelancersId,
      supervisorId,
      ...others
    } = result;

    result = others;
  }

  // ==================================================
  // FREELANCER
  // ==================================================

  else if (req.user.role === "freelancer") {
    // ------------------------------------------
    // OPEN PROJECT
    // ------------------------------------------

    if (result.stage === "open") {
      delete result.budget;

      result = {
        ...result,
        proposalBudget: result.proposalBudget,
      };
    }

    // ------------------------------------------
    // ACTIVE / COMPLETED
    // ------------------------------------------

    else if (
      result.stage === "active" ||
      result.stage === "completed"
    ) {
      const isAssigned = result.freelancersId?.some(
        (freelancer) =>
          freelancer._id?.toString() ===
          req.user._id.toString()
      );

      if (!isAssigned) {
        throw new ApiError(
          403,
          "You can't access this project dude!"
        );
      }

      const proposal = await Proposal.findOne({
        projectId: result._id,
        freelancerId: req.user._id,
        status: "accepted",
      }).select("proposedCost");

      delete result.budget;

      result = {
        ...result,
        proposedCost: proposal?.proposedCost ?? null,
      };
    }
  }

  // ==================================================
  // SUPERVISOR
  // ==================================================

  else if (req.user.role === "supervisor") {
    const supervisor = await Supervisor.findOne({
      userId: req.user._id,
    });

    if (!supervisor) {
      throw new ApiError(
        403,
        "Supervisor profile not found"
      );
    }

    if (result.stage !== "open") {
      if (
        !result.supervisorId?._id?.equals(req.user._id)
      ) {
        throw new ApiError(
          403,
          "You can't access to this project bro!"
        );
      }
    }
  }

  // ==================================================
  // RESPONSE
  // ==================================================

  res.status(200).json({
    result,
  });
});

const updateProject = asyncHandler(async (req, res) => {
  const p = await Project.findById(req.params.id);

  if (!p) {
    throw new ApiError(404, "Project not found");
  }
  if (!p.supervisorId.equals(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "you can't edit this project!");
  }
  if (p.stage === "completed") {
    throw new ApiError(403, "Cannot edit a completed project");
  }

  // Prevent updating to "completed" stage
  if (req.body.stage === "completed") {
    throw new ApiError(403, "Cannot set project to completed status");
  }
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true },
  );
  res.status(200).json(project);
});

const deleteProject = asyncHandler(async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.status(200).json("Project has been deleted by admin ...");
});
// post
const editRequestByEmployer = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found!");
  }

  const employer = await Employer.findOne({
    userId: req.user._id,
  });

  if (!employer) {
    throw new ApiError(404, "Employer profile not found!");
  }

  // Make sure this employer owns the project
  if (!project.employerId.equals(req.user._id)) {
    throw new ApiError(403, "You can't access this project!");
  }

  // Optional additional check if you keep projects
  // inside Employer.projects
  const hasProject = employer.projects?.some((projectId) =>
    projectId.equals(project._id),
  );

  if (!hasProject) {
    throw new ApiError(403, "This project doesn't belong to you!");
  }

  // Project is currently being worked on
  if (project.stage === "active") {
    throw new ApiError(403, "Project is still in progress!");
  }

  // Already requested an edit
  if (project.editCount <= 0) {
    throw new ApiError(
      400,
      "You have already requested an edit for this project!",
    );
  }
  // Find project's ticket
  const ticket = await Ticket.findOne({
    userId: employer.userId,
    relatedProject: project._id,
  });

  if (!ticket) {
    throw new ApiError(404, "Project ticket not found!");
  }

  // Change project status
  project.status = "درخواست اصلاحیه";
  project.editCount -= 1;

  // Create message
  const newMessage = await TicketMessage.create({
    ticket: ticket._id,
    senderRole: req.user.role,
    sender: req.user._id,
    text:
      "درخواست ویرایش این پروژه را دارم. " +
      "(کارفرما لطفاً درخواستتان را به صورت واضح و دقیق زیر این پیام ارسال کنید)",
  });

  await project.save();

  res.status(201).json({
    message: "Your edit request has been submitted successfully!",
    project,
    ticketMessage: newMessage,
  });
});
const confirmResultResult = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found!");
  }

  // ------------------------------------------
  // EMPLOYER
  // ------------------------------------------
  if (req.user.role === "employer") {
    if (!project.employerId.equals(req.user._id)) {
      throw new ApiError(
        403,
        "Can't access here dude! It's for another employer.",
      );
    }

    const task = await Task.findOne({
      projectId: project._id,
      employerId: req.user._id,
    });
    if (!task) {
      throw new ApiError(404, "Task not found!");
    }

    const now = new Date();

    task.employerApproval = "approved";
    task.column = "completed";
    task.lastUpdate = now;
    task.employerApprovalDate = now;
    task.statusText = "completed";

    if (task.startDate) {
      const durationMs = now - task.startDate;
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      task.duration = `${durationDays} days`;
    }

    task.settlementStatus =
      project.budget - project.paidAmount <= 0 ? "Settled" : "Awaiting";

    await task.save();
    project.status = "تایید خروجی کارفرما";
  }

  // ------------------------------------------
  // SUPERVISOR
  // ------------------------------------------
  else if (req.user.role === "supervisor") {
    if (!project.supervisorId.equals(req.user._id)) {
      throw new ApiError(
        403,
        "Can't access here dude! It's for another supervisor.",
      );
    }
    for (const freeid of project.freelancersId) {
      const freeTask = await Task.findOne({
        projectId: project._id,
        freelancerId: freeid,
      });

      if (!freeTask) {
        throw new ApiError(404, "Task not found!");
      }

      const now2 = new Date();

      freeTask.employerApproval = "approved";
      freeTask.column = "completed";
      freeTask.lastUpdate = now2;
      freeTask.employerApprovalDate = now2;
      freeTask.approvalStatus = "approved";
      freeTask.statusText = "completed";

      if (freeTask.startDate) {
        const durationMs = now2 - freeTask.startDate;

        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

        freeTask.duration = `${durationDays} days`;
      }

      freeTask.settlementStatus = "Settled";

      await freeTask.save();
    }

    const task = await Task.findOne({
      projectId: project._id,
      employerId: project.employerId,
    });

    if (!task) {
      throw new ApiError(404, "Task not found!");
    }

    const now = new Date();

    task.employerApproval = "approved";
    task.column = "completed";
    task.lastUpdate = now;
    task.employerApprovalDate = now;
    task.statusText = "completed";

    if (task.startDate) {
      const durationMs = now - task.startDate;
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      task.duration = `${durationDays} days`;
    }

    task.settlementStatus =
      project.budget - project.paidAmount <= 0 ? "Settled" : "Awaiting";

    await task.save();

    project.stage = "completed";
    project.status = "خاتمه یافته";

    await Notifications.create({
      userId: project.employerId,
      type: "project",
      title: "پروژه توسط ناظر تایید و خاتمه یافت",
      text: `پروژه ${project.title} توسط ناظر تایید و به پایان رسید ممنون از همکاری شما. `,
      btnText: "هدایت به پروژه",
      relatedProjectId: project._id,
      relatedProjectPath: "/employer-projects/",
    });
    const ticketIds = project.ticketIds.map((ticket) => ticket.ticketId);

    await Ticket.updateMany(
      { _id: { $in: ticketIds } },
      {
        $set: {
          status: "closed",
          stage: "archived",
        },
      },
    );
  }

  // ------------------------------------------
  // ADMIN
  // ------------------------------------------
  else if (req.user.role === "admin") {
    project.stage = "completed";
    project.status = "خاتمه یافته";

    for (const freeid of project.freelancersId) {
      const freeTask = await Task.findOne({
        projectId: project._id,
        freelancerId: freeid,
      });

      if (!freeTask) {
        throw new ApiError(404, "Task not found!");
      }

      const now2 = new Date();

      freeTask.employerApproval = "approved";
      freeTask.column = "completed";
      freeTask.lastUpdate = now2;
      freeTask.employerApprovalDate = now2;
      freeTask.approvalStatus = "approved";
      freeTask.statusText = "completed";

      if (freeTask.startDate) {
        const durationMs = now2 - freeTask.startDate;

        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

        freeTask.duration = `${durationDays} days`;
      }

      freeTask.settlementStatus = "Settled";

      await freeTask.save();
    }

    const task = await Task.findOne({
      projectId: project._id,
      employerId: project.employerId,
    });

    if (!task) {
      throw new ApiError(404, "Task not found!");
    }

    const now = new Date();

    task.employerApproval = "approved";
    task.column = "completed";
    task.lastUpdate = now;
    task.employerApprovalDate = now;
    task.statusText = "completed";

    if (task.startDate) {
      const durationMs = now - task.startDate;
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      task.duration = `${durationDays} days`;
    }

    task.settlementStatus =
      project.budget - project.paidAmount <= 0 ? "Settled" : "Awaiting";

    await task.save();

    await Notifications.create({
      userId: project.employerId,
      type: "project",
      title: "پروژه توسط ناظر تایید و خاتمه یافت",
      text: `پروژه ${project.title} توسط ناظر تایید و به پایان رسید ممنون از همکاری شما. `,
      btnText: "هدایت به پروژه",
      relatedProjectId: project._id,
      relatedProjectPath: "/employer-projects/",
    });
    const ticketIds = project.ticketIds.map((ticket) => ticket.ticketId);

    await Ticket.updateMany(
      { _id: { $in: ticketIds } },
      {
        $set: {
          status: "closed",
          stage: "archived",
        },
      },
    );
  }

  // ------------------------------------------
  // INVALID ROLE
  // ------------------------------------------
  else {
    throw new ApiError(403, "The role is not valid!");
  }

  await project.save();

  res.status(200).json({
    message: "Project has been confirmed!",
    project,
  });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignFreelancer,
  addProjectReview,
  editProjectPrice,
  editRequestByEmployer,
  confirmResultResult,
};
