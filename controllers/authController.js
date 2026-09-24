// Register / login / refresh. Passwords are hashed with bcrypt (ASVS V2.4.1)
// and never returned or logged. Access tokens are short-lived; refresh
// tokens are longer-lived (ASVS V3 session management).
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { User, Freelancer, Employer, Supervisor, Admin, Ticket, Department, TicketMessage } = require("../models");
const Project = require("../models/Project");
const { getLevelLabel, resolveDepartmentName } = require("../utils/resolvers");


const getUsers = asyncHandler(async (req, res) => {
  const { role, query } = req.query;

  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (query?.trim()) {
    const q = query.trim();

    filter.$or = [
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
      { username: { $regex: q, $options: "i" } },
    ];
  }

  const users = await User.find(filter);

  res.status(200).json({
    success: true,
    users,
  });
});

const ROLE_LABELS = {
  user: "کاربر عادی",
  freelancer: "فریلنسر",
  employer: "کارفرما",
  supervisor: "ناظر",
  admin: "ادمین",
};

const getUserDirectory = asyncHandler(async (req, res) => {
  const users = await User.find().lean();

  // level lives on the separate Freelancer collection, not on User itself -
  // fetch it in one query instead of per-user.
  const freelancerIds = users.filter((u) => u.role === "freelancer").map((u) => u._id);
  const freelancerProfiles = await Freelancer.find({ userId: { $in: freelancerIds } })
    .select("userId level")
    .lean();
  const levelByUserId = new Map(freelancerProfiles.map((f) => [f.userId.toString(), f.level]));

  const userDirectory = users.map((user) => {
    const level = levelByUserId.get(user._id.toString());
    return {
      ...user,
      roleKey: user.role,
      roleText: ROLE_LABELS[user.role] || user.role,
      levelLabel: level ? getLevelLabel(level) : null,
    };
  });

  res.status(200).json({
    success: true,
    users: userDirectory,
  });
});


const getDeptUserDirectory = asyncHandler(async (req, res) => {
  // ------------------------------------------
  // GET USERS
  // ------------------------------------------

  const [supervisors, employers, freelancers] = await Promise.all([
    User.find({ role: "supervisor" })
      .select("firstName lastName initial username")
      .lean(),

    User.find({ role: "employer" })
      .select("firstName lastName initial username")
      .lean(),

    User.find({ role: "freelancer" })
      .select("firstName lastName initial username income")
      .lean(),
  ]);

  // ------------------------------------------
  // GET PROJECTS
  // ------------------------------------------

  const supervisorIds = supervisors.map((user) => user._id);
  const employerIds = employers.map((user) => user._id);

  const [supervisorProjects, employerProjects] = await Promise.all([
    Project.find({
      supervisorId: { $in: supervisorIds },
    })
      .select("title supervisorId")
      .lean(),

    Project.find({
      employerId: { $in: employerIds },
      stage: "active",
    })
      .select("title employerId")
      .lean(),
  ]);

  // ------------------------------------------
  // BUILD RESPONSE
  // ------------------------------------------

  const supervisorsData = supervisors.map((user) => ({
    id: user._id,
    name: `${user.firstName} ${user.lastName}`,
    initial: user.initial,
    username: user.username,
    role: "supervisor",

    projects: supervisorProjects
      .filter(
        (project) =>
          project.supervisorId.toString() === user._id.toString()
      )
      .map((project) => project.title),
  }));

  const employersData = employers.map((user) => ({
    id: user._id,
    name: `${user.firstName} ${user.lastName}`,
    initial: user.initial,
    username: user.username,
    role: "employer",

    debt: 0,

    activeProjects: employerProjects
      .filter(
        (project) =>
          project.employerId.toString() === user._id.toString()
      )
      .map((project) => project.title),
  }));

  const freelancersData = freelancers.map((user) => ({
    id: user._id,
    name: `${user.firstName} ${user.lastName}`,
    initial: user.initial,
    username: user.username,

    role: "freelancer",

    credit: user.income || 0,
  }));

  // ------------------------------------------
  // RESPONSE
  // ------------------------------------------

  res.status(200).json({
    success: true,
    data: {
      supervisors: supervisorsData,
      employers: employersData,
      freelancers: freelancersData,
    },
  });
});


const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ------------------------------------------
  // AUTHORIZATION
  // ------------------------------------------

  const restrictedRoles = [
    "user",
    "freelancer",
    "employer"
  ];

  if (
    restrictedRoles.includes(req.user.role) &&
    req.user._id.toString() !== id
  ) {
    throw new ApiError(
      403,
      "You are not allowed to view this profile!"
    );
  }

  // ------------------------------------------
  // FIND USER
  // ------------------------------------------

  const user = await User.findById(id)
    .select("-password")
    .lean();

  if (!user) {
    throw new ApiError(
      404,
      "User not found!"
    );
  }

  // ------------------------------------------
  // FIND USER PROJECTS
  // ------------------------------------------

  const projects = await Project.find({
    $or: [
      {
        freelancersId: user._id,
      },
      {
        employerId: user._id,
      },
    ],
  })
    .select("_id title")
    .lean();

  // ------------------------------------------
  // BUILD PROFILE
  // ------------------------------------------

  let levelLabel = null;
  let resolvedSkills = [];
  if (user.role === "freelancer") {
    const freelancerProfile = await Freelancer.findOne({ userId: user._id })
      .select("level")
      .lean();
    levelLabel = freelancerProfile?.level ? getLevelLabel(freelancerProfile.level) : null;
    resolvedSkills = user.skills;
  }

  const userProfile = {
    ...user,
    levelLabel,
    skills: resolvedSkills,

    projects: projects.map((project, index) => ({
      id: project._id,
      title: project.title,
      isHighlighted: index === 0,
    })),
  };

  // ------------------------------------------
  // RESPONSE
  // ------------------------------------------

  res.status(200).json({
    success: true,
    data: userProfile,
  });
});

// Only these fields may be changed through this endpoint. role, password,
// walletBalance, income, status etc. are deliberately excluded - they need
// their own dedicated flows (registerRole, a password-reset endpoint,
// wallet charge/release), not a generic PATCH.
const UPDATABLE_USER_FIELDS = [
  "firstName", "lastName", "avatarColor", "initial",
  "birthDate", "province", "city", "education",
];

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const patch = {};
  for (const field of UPDATABLE_USER_FIELDS) {
    if (req.body[field] !== undefined) patch[field] = req.body[field];
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: patch },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!updatedUser) {
    throw new ApiError(404, "User not found!");
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    data: updatedUser,
  });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});


const ROLE_MODEL = {
    freelancer: Freelancer,
    employer: Employer,
    supervisor: Supervisor,
    admin: Admin,
};

const signTokens = (user) => {
  const accessToken = jwt.sign(
    { sub: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES,
    },
  );
  const refreshToken = jwt.sign(
    { sub: user._id },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES,
    },
  );
  return { accessToken, refreshToken };
};
const register = asyncHandler(async (req, res) => {
    const { password, ...rest } = req.body;

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
        ...rest,
        uniqueId: `US${Date.now()}`,
        password: hashed
    });

    const tokens = signTokens(user);

    res.status(201).json({
        user: {
            id: user._id,
            role: user.role
        },
        ...tokens
    });
});

const registerRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    const roleModels = {
        freelancer: Freelancer,
        employer: Employer,
        supervisor: Supervisor,
    };

    const Model = roleModels[role];

    if (!Model) {
        throw new ApiError(400, "Invalid role");
    }

    const user = await User.findById(req.user._id);

    if (!user || user.status !== "active") {
        throw new ApiError(403, "User not found or user is inactive");
    }

    const alreadyHasRole = user.roles.includes(role);

    // Supervisor is a privileged role.
    // The user must already have supervisor in their roles.
    if (role === "supervisor" && !alreadyHasRole) {
        throw new ApiError(
            403,
            "You are not authorized to register as a supervisor"
        );
    }

    // The requested role becomes the active/latest role
    user.role = role;

    // New role
    if (!alreadyHasRole) {
        user.roles.push(role);

        let uniqueSetter;

        switch (role) {
            case "employer":
                uniqueSetter = "EM";
                break;

            case "freelancer":
                uniqueSetter = "FR";
                break;

            default:
                throw new ApiError(400, "Invalid role");
        }

        user.uniqueId = `${uniqueSetter}${Date.now()}`;
        
        if (role === "freelancer"){
            let authDepartment = await Department.findOne({name : "احراز هویت"});
            if(!authDepartment){
                authDepartment = await Department.create({name : "احراز هویت"});
            }
            if (!authDepartment.freelancers.some(id => id.equals(user._id))) {
                authDepartment.freelancers.push(user._id);
                await authDepartment.save();
            }
            
            const ticket = await Ticket.create({
                title : "تیکت احراز هویت فریلنسر" + user.username,
                description : "این تیکت صرفا برای احراز هویت این فریلنسر توسط ناظر این دپارتمان صورت میگیرد",
                userId : user._id,
                department : authDepartment._id,
                priority : "متوسط",
                freelancer : user._id,
            });
            const createTicketMessage = await TicketMessage.create({
                ticket : ticket._id,
                senderRole : "freelancer",
                sender : user._id,
                text : "برای احراز هویت ابتدا خود را معرفی و در شاخه تخصصی که کار میکنید را بنویسید . سپس منتظر بمانید تا ناظر مربوطه به شما مراجعه و فرآیند احراز هویت تکمیل شود"
            })
            
            console.log(`${user.username} has been requested for verification!`);
            
        }


        await user.save();

        await Model.create({
            userId: user._id,
        });
    } 
    
    // Existing role
    else {
        // If switching to supervisor, make sure its profile exists.
        if (role === "supervisor") {
            const existingSupervisor = await Supervisor.findOne({
                userId: user._id,
            });

            if (!existingSupervisor) {
                await Supervisor.create({
                    userId: user._id,
                });
            }

            // Generate supervisor ID when activating supervisor
            user.uniqueId = `SU${Date.now()}`;
        }

        await user.save();
    }

    // New token contains the new active role
    const tokens = signTokens(user);

    res.status(201).json({
        message: alreadyHasRole
            ? `Role '${role}' selected successfully`
            : `Role '${role}' registered successfully`,

        user: {
            id: user._id,
            role: user.role,
            roles: user.roles,
            uniqueId: user.uniqueId,
        },

        ...tokens,
    });
});


const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).select("+password");

  // ASVS V2.2.1 - one generic error for both "no such user" and "wrong password"
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid username or password");
  }
  if (user.status !== "active") {
    throw new ApiError(403, "Account is inactive");
  }

  const tokens = signTokens(user);
  res.json({ user: { id: user._id, role: user.role }, ...tokens });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, "User not found");
  res.json(signTokens(user));
});

module.exports = { register, login, refresh, registerRole , getUsers , getUserDirectory  , getDeptUserDirectory , getUserProfile , updateUser , getMyProfile };
