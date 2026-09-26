const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Ticket = require("../models/Ticket");
const Department = require("../models/Department");
const Supervisor = require("../models/Supervisor");
const FinanceProject = require("../models/FinanceProject");
const Project = require("../models/Project");
const TicketMessage = require("../models/TicketMessage");
const Notifications = require("../models/Notifications");
const User = require("../models/User");

const getFinanceStats = asyncHandler(async (req, res) => {

    const activeProjectsCount = await Project.countDocuments({
        stage: "active"
    });

    const financeProjects = await FinanceProject.find({});

    let totalPending = 0;
    let totalPaid = 0;
    let releasedThisMonth = 0;
    let totalBlocked = 0;

    const now = new Date();

    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
    );

    for (const financeProject of financeProjects) {

        totalBlocked += financeProject.blockedAmount || 0;

        for (const transaction of financeProject.transactions) {

            if (transaction.state === "pending") {
                totalPending += transaction.amount || 0;
            }

            if (transaction.state === "paid") {

                totalPaid += transaction.amount || 0;

                if (
                    transaction.date >= startOfMonth &&
                    transaction.date < startOfNextMonth
                ) {
                    releasedThisMonth += transaction.amount || 0;
                }
            }
        }
    }

    const awaitingSettlement = totalPending - totalPaid;

    res.status(200).json({
        financeStats: {
            activeProjectsCount,
            awaitingSettlement,
            releasedThisMonth,
            totalBlocked
        }
    });
});

const createfinanceProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.body.projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  if (req.user.role === "supervisor") {
    if (!project.supervisorId.equals(req.user._id)) {
      throw new ApiError(
        403,
        "You can't access here! this project is for another supervisor.",
      );
    }
  }

  const newFinanceProject = await FinanceProject.create(req.body);
  res.status(201).json(newFinanceProject);
});

const getFinanceProjectById = asyncHandler(async (req, res) => {
  const financeProject = await FinanceProject.findById(req.params.id).populate("projectId", "employerId supervisorId");
  if (!financeProject) {
    throw new ApiError(404, "Finance project not found.");
  }

  if (req.user.role === "supervisor") {
    if (!financeProject.projectId.supervisorId.equals(req.user._id)) {
      throw new ApiError(
        403,
        "You can't access here! this project is for another supervisor.",
      );
    }
  }
  res.status(200).json(financeProject);
});
const getFinanceProjectByProjectId = asyncHandler(async (req, res) => {
  const financeProject = await FinanceProject.findOne({
    projectId: req.params.id,
  }).populate("projectId", "supervisorId employerId");
  if (!financeProject) {
    throw new ApiError(404, "Finance project not found for this project.");
  }
  if (req.user.role === "supervisor") {
    if (!financeProject.projectId.supervisorId.equals(req.user._id)) {
      throw new ApiError(404, "Finance project not found for this project.");
    }
  }
  res.status(200).json(financeProject);
});

const getFinanceProjects = asyncHandler(async (req, res) => {
  if (req.user.role === "supervisor") {
    const projectIds = await Project.find({
      supervisorId: req.user._id,
    }).distinct("_id");

    const financeProjects = await FinanceProject.find({
      projectId: { $in: projectIds },
    }).populate("projectId", "employerId supervisorId");

    return res.status(200).json({
      count: financeProjects.length,
      financeProjects,
    });
  } else if (req.user.role === "admin") {
    const financeProjects = await FinanceProject.find({}).populate("projectId", "employerId supervisorId");

    return res.status(200).json({
      count: financeProjects.length,
      financeProjects,
    });
  } else {
    throw new ApiError(
      403,
      "You are not authorized to access finance projects.",
    );
  }
});

const updateFinanceProject = asyncHandler(async (req, res) => {
  const financeProject = await FinanceProject.findById(req.params.id).populate(
    "projectId",
    "supervisorId",
  );
  if (!financeProject) {
    throw new ApiError(404, "Finance project not found.");
  }

  if (req.user.role === "supervisor") {
    if (!financeProject.projectId.supervisorId.equals(req.user._id)) {
      throw new ApiError(
        403,
        "You can't access here! this project is for another supervisor.",
      );
    }
  }
  const updatedFinanceProject = await FinanceProject.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true },
  );
  res.status(200).json(updatedFinanceProject);
});
// only admin can do that and i got this using my middle wares mf
const deleteFinanceProject = asyncHandler(async (req, res) => {
  await FinanceProject.findByIdAndDelete(req.params.id);
  res.status(200).json("Finance Project has been deleted by admin ...");
});

const resolveUserIdByName = async(req , res)=>{
  try{
    await User.find({})
  } catch(err){
    return res.status(400).json(err)
  }
}
const createTransaction = asyncHandler(async (req, res) => {
  const financeProject = await FinanceProject.findById(req.params.id).populate(
    "projectId",
    "supervisorId",
  );
  if (!financeProject) {
    throw new ApiError(404, "financeProject not found!");
  }
  if (req.user.role === "supervisor") {
    if (!financeProject.projectId.supervisorId?.equals(req.user._id)) {
      throw new ApiError(403, "you can't access here dude!");
    }
  }
  
  financeProject.transactions.push(req.body);
  if (req.body.status === "در انتظار پرداخت"){
    const ticket = await Ticket.findOne({relatedProject : financeProject.projectId , userId : req.body.targetId});
    if(!ticket){
      throw new ApiError(404 , "Something went wrong!")
    }
    await Notifications.create({
      userId : req.body.targetId,
      type : "wallet",
      title : "درخواست برای پرداخت",
      text : "در خواست پرداخت از سوی ناظر برای شما ثبت گردید لطفا برای پرداخت اقدام نمایید",
      btnText : "پرداخت",
      relatedProjectId : financeProject.projectId,
      relatedTicketId : ticket._id,
      relatedTicketTitle : ticket.title,
    })
    await TicketMessage.create({
      ticket : ticket._id,
      senderRole : "supervisor",
      sender : req.user._id,
      text : `درخواست پرداخت توسط ناظر برای شما صادر شد به مبلغ ${req.body.amount}`
    })
    
  }


  await financeProject.save();

  res.status(201).json({
    message: "Transaction created successfully.",
    transaction:
      financeProject.transactions[financeProject.transactions.length - 1],
  });
});
const readTransactions = asyncHandler(async (req, res) => {
  const financeProject = await FinanceProject.findById(req.params.id).populate(
    "projectId",
    "supervisorId",
  );
  if (!financeProject) {
    throw new ApiError(404, "financeProject not found!");
  }
  if (req.user.role === "supervisor") {
    if (!financeProject.projectId.supervisorId?.equals(req.user._id)) {
      throw new ApiError(403, "you can't access here dude!");
    }
  }
  res.status(200).json(financeProject.transactions);
});

// finance/{id}/transactions/{id2}
const deleteTransaction = asyncHandler(async (req, res) => {
  const financeProject = await FinanceProject.findById(req.params.id).populate(
    "projectId",
    "supervisorId",
  );
  if (!financeProject) {
    throw new ApiError(404, "financeProject not found!");
  }
  if (req.user.role === "supervisor") {
    if (!financeProject.projectId.supervisorId?.equals(req.user._id)) {
      throw new ApiError(403, "you can't access here dude!");
    }
  }
  const transaction = financeProject.transactions.id(req.params.id2);

  if (!transaction) {
    throw new ApiError(404, "Transaction not found!");
  }

  transaction.deleteOne();

  await financeProject.save();

  res.status(200).json({
    message: "Transaction deleted successfully.",
  });
});


const releaseFinanceTransaction = asyncHandler(async (req, res) => {

    const financeProject = await FinanceProject.findById(
        req.params.id
    ).populate("projectId", "supervisorId freelancersId");

    if (!financeProject) {
        throw new ApiError(
            404,
            "Finance project not found!"
        );
    }
    // Supervisor can only release money from their own projects
    if (req.user.role === "supervisor") {

        if (
            !financeProject.projectId.supervisorId?.equals(
                req.user._id
            )
        ) {
            throw new ApiError(
                403,
                "You can't access this project!"
            );
        }
    }

    const { amount, freelancerId } = req.body;
    if (!financeProject.projectId.freelancersId?.some(
    (id) => id.equals(freelancerId)
    ) ){
      throw new ApiError(403, "Invalid freelancer id!");
    }
    const freelancer = await User.findById(freelancerId);
    if (!freelancer) {
      throw new ApiError(404, "Freelancer not found!");
    }

    const releaseAmount = Number(amount);

    if (!Number.isFinite(releaseAmount) || releaseAmount <= 0) {
        throw new ApiError(
            400,
            "Amount must be a valid positive number."
        );
    }

    if (releaseAmount > financeProject.blockedAmount) {
        throw new ApiError(
            400,
            `Release amount cannot be greater than the blocked amount (${financeProject.blockedAmount}).`
        );
    }

    const transaction = {
        amount: releaseAmount,
        status: "پرداخت شد",
        target: `${freelancer.firstName} ${freelancer.lastName}`,
        targetId : freelancerId,
        state: "paid",
    };

    financeProject.transactions.push(transaction);

    // Remove the released amount from blocked money
    financeProject.blockedAmount -= releaseAmount;

    await financeProject.save();

    const newTransaction =
        financeProject.transactions[
            financeProject.transactions.length - 1
        ];

    res.status(201).json({
        ok: true,
        transaction: newTransaction,
        blockedAmount: financeProject.blockedAmount,
    });
});
// next phase deploy crud for transactions as well for now we don't need it ;

module.exports = {
  getFinanceStats,
  deleteTransaction , readTransactions , createTransaction,
  createfinanceProject,
  getFinanceProjectById,
  getFinanceProjectByProjectId,
  getFinanceProjects,
  updateFinanceProject,
  deleteFinanceProject,
  releaseFinanceTransaction
};
