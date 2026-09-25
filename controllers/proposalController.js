const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Proposal = require("../models/Proposal");
const Freelancer = require("../models/Freelancer");
const Project = require("../models/Project");
const Supervisor = require("../models/Supervisor");
const { createTicket } = require("./ticketController");
const Ticket = require("../models/Ticket");
const Task = require("../models/Task");
const { resolveDepartmentName } = require("../utils/resolvers");
const Department = require("../models/Department");

const createProposal = asyncHandler(async (req, res) => {
    const project = await Project.findById(
        req.params.id
    );
    if (!project) {
        throw new ApiError(
            404,
            "Project not found!"
        );
    }
    if (req.user.role === "freelancer"){

        const freelancer = await Freelancer.findOne({
            userId: req.user._id
        });
    
        if (!freelancer) {
            throw new ApiError(
                404,
                "Freelancer not found!"
            );
        }
        
        // Freelancer must be available
        if (!freelancer.availableForProposals) {
            throw new ApiError(
                403,
                "You can't send proposals right now!"
            );
        }
        // Level hierarchy: A > B > C
        const levelValue = {
            a: 3,
            b: 2,
            c: 1
        };
    
        // Freelancer must be equal or higher level than project
        if (
            levelValue[freelancer.level] <
            levelValue[project.level]
        ) {
            throw new ApiError(
                403,
                "Your level is not high enough for this project!"
            );
        }

        // Project must be open
        if (project.stage !== "open") {
            throw new ApiError(
            403,
            "You can only send proposals for open projects!"
        );
    }
        
    }

    

    

    



    const proposal = await Proposal.create({
        projectId: project._id,
        freelancerId: req.user._id,
        status: "pending",
        note: req.body.note || "i have a proposal for this project!",
        proposedCost : req.body.proposedCost || project.proposalBudget,
    });

    res.status(201).json(proposal);
});
const declareReadiness = asyncHandler(async (req, res) => {
    const { id: projectId } = req.params;

    const freelancerId = req.user._id;

    // ------------------------------------------
    // FIND PROJECT
    // ------------------------------------------

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // ------------------------------------------
    // PROJECT MUST BE OPEN
    // ------------------------------------------

    if (project.stage !== "open") {
        throw new ApiError(
            400,
            "You can only apply to an open project"
        );
    }

    // ------------------------------------------
    // CHECK IF ALREADY ASSIGNED
    // ------------------------------------------

    const alreadyAssigned = project.freelancersId.some(
        (id) => id.equals(freelancerId)
    );

    if (alreadyAssigned) {
        throw new ApiError(
            400,
            "You are already assigned to this project"
        );
    }

    // ------------------------------------------
    // CHECK EXISTING PROPOSAL
    // ------------------------------------------

    const existingProposal = await Proposal.findOne({
        projectId: project._id,
        freelancerId,
    });

    if (existingProposal) {
        return res.status(200).json({
            ok: true,
            message: "You have already declared readiness for this project",
            proposal: existingProposal,
        });
    }

    // ------------------------------------------
    // CREATE PROPOSAL
    // ------------------------------------------

    const proposal = await Proposal.create({
        projectId: project._id,
        freelancerId,
        status: "pending",
        proposedCost: project.proposalBudget,
        note: "I (freelancer) want to do this project for its proposal Budget cost",
    });

    res.status(201).json({
        ok: true,
        proposal,
    });
});

// req.params.id = projectId
const getProposalStatusLabel = asyncHandler(async (req, res) => {
    const count = await Proposal.countDocuments({
        projectId: req.params.id
    });

    res.status(200).json({
        count,
        label:
            count > 0
                ? `${count.toLocaleString("fa-IR")} درخواست ثبت شده`
                : "پیشنهادی ثبت نشده"
    });
});
// gives req.params.id
const getProposalsForProject = asyncHandler(async (req, res) => {

    const proposals = await Proposal.find({
        projectId: req.params.id
    })
        .populate({
            path: "projectId",
            select: "departmentId",
            populate: {
                path: "departmentId",
                select: "name"
            }
        })
        .populate({
            path: "freelancerId",
            select: "firstName lastName username"
        });

    // Employer cannot see proposals
    if (req.user.role === "employer") {
        throw new ApiError(
            403,
            "You are not allowed to see proposals!"
        );
    }

    // Get Freelancer profiles
    const freelancerIds = proposals
        .map(proposal => proposal.freelancerId?._id)
        .filter(Boolean);

    const freelancers = await Freelancer.find({
        userId: { $in: freelancerIds }
    }).select("userId level rateScore");

    // Create a quick lookup map:
    // User ID -> Freelancer profile
    const freelancerMap = new Map();

    for (const freelancer of freelancers) {
        freelancerMap.set(
            freelancer.userId.toString(),
            freelancer
        );
    }

    // Add freelancer profile information to each proposal
    const formattedProposals = proposals.map(proposal => {

        const freelancer = freelancerMap.get(
            proposal.freelancerId?._id?.toString()
        );

        return {
            ...proposal.toObject(),

            freelancer: proposal.freelancerId
                ? {
                    firstName: proposal.freelancerId.firstName,
                    lastName: proposal.freelancerId.lastName,
                    username: proposal.freelancerId.username,

                    level: freelancer?.level ?? null,
                    rateScore: freelancer?.rateScore ?? null
                }
                : null
        };
    });

    // Freelancer can only see their own proposal
    if (req.user.role === "freelancer") {

        const myProposals = formattedProposals.filter(
            proposal =>
                proposal.freelancerId?._id?.toString() ===
                req.user._id.toString()
        );

        return res.status(200).json(myProposals);
    }

    // Supervisor can only see proposals
    // from their departments
    if (req.user.role === "supervisor") {

        const supervisor = await Supervisor.findOne({
            userId: req.user._id
        });

        if (!supervisor) {
            throw new ApiError(
                404,
                "Supervisor profile not found!"
            );
        }

        if (
            !formattedProposals[0]?.projectId?.departmentId ||
            !supervisor.departments.includes(
                formattedProposals[0].projectId.departmentId.name
            )
        ) {
            throw new ApiError(
                403,
                "You can't view proposals from another department!"
            );
        }
    }

    // Admin and authorized supervisor
    res.status(200).json(formattedProposals);
});
// id2 = proposal ID
const readProposalById = asyncHandler(async (req, res) => {
    const proposal = await Proposal.findById(
        req.params.id2
    ).populate({
        path: "projectId",
        select: "departmentId",
        populate: {
            path: "departmentId",
            select: "name"
        }
    });

    if (!proposal) {
        throw new ApiError(
            404,
            "Proposal not found!"
        );
    }

    // Employer cannot see proposals
    if (req.user.role === "employer") {
        throw new ApiError(
            403,
            "You are not allowed to see proposal!"
        );
    }

    // Freelancer can only see their own proposal
    if (req.user.role === "freelancer") {

        if (!proposal.freelancerId.equals(req.user._id)) {
            throw new ApiError(
                403,
                "You can only view your own proposal!"
            );
        }
    }

    // Supervisor can only see proposals
    // from their departments
    else if (req.user.role === "supervisor") {

        const supervisor = await Supervisor.findOne({
            userId: req.user._id
        });

        if (!supervisor) {
            throw new ApiError(
                404,
                "Supervisor profile not found!"
            );
        }

        if (
            !proposal.projectId?.departmentId ||
            !supervisor.departments.includes(
                proposal.projectId.departmentId.name
            )
        ) {
            throw new ApiError(
                403,
                "You can't view proposal from another department!"
            );
        }
    }

    // Admin reaches here automatically
    res.status(200).json(proposal);
});

// warining only admin must be available to do this 
const deleteProposal = asyncHandler(async(req , res)=>{
    await Proposal.findByIdAndDelete(req.params.id2);
    res.status(200).json("Proposal deleted successfully!")
})
// req.params.id2 = proposal id
const reviewProposal = asyncHandler(async (req, res) => {

    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
        throw new ApiError(
            400,
            "Status must be accepted or rejected."
        );
    }

    const proposal = await Proposal.findById(req.params.id2);

    if (!proposal) {
        throw new ApiError(
            404,
            "Proposal not found!"
        );
    }

    const project = await Project.findById(proposal.projectId);

    if (!project) {
        throw new ApiError(
            404,
            "Project not found!"
        );
    }



    // Supervisor can only review their own projects
    if (req.user.role === "supervisor") {

        if (!project.supervisorId?.equals(req.user._id)) {
            throw new ApiError(
                403,
                "You can't review proposals for another supervisor's project!"
            );
        }
    }

    // Update proposal
    proposal.status = status;

    await proposal.save();

    // If accepted, assign freelancer to project
    if (status === "accepted") {

        const alreadyAssigned = project.freelancersId.some(
            freelancerId =>
                freelancerId.equals(proposal.freelancerId)
        );

        if (!alreadyAssigned) {
            // check this dude!
            await Freelancer.findOneAndUpdate(
                { userId: proposal.freelancerId },
                {
                  $addToSet: {
                    projects: project._id,
                  },
                }
              );

            const newTicket = await Ticket.create({
                title : "تیکت " + project.title,
                description : "its a project ticket between you and supervisor of this project",
                department: project.departmentId,
                userId: proposal.freelancerId,
                priority : "کم",
                relatedProject : project._id,
                freelancer : proposal.freelancerId,
                supervisor : project.supervisorId,
                employer : project.employerId
            });
            await Task.create({
                projectId : project._id,
                freelancerId : proposal.freelancerId,
                column : "deposited",
                title : project.title,
                department : await resolveDepartmentName(project.departmentId),
                startDate : new Date(),
                relatedTicketId : newTicket._id,
                employerApproval : "under review",
                statusText : "active",
                approvalStatus : "under review",
                settlementStatus : "Awaiting"
                    });

            project.ticketIds.push({ticketId : newTicket._id , userId : proposal.freelancerId});
            
            project.freelancersId.push(
                proposal.freelancerId
            );
            
            project.status = "در حال انجام";
            project.stage = "active";

            await Department.findByIdAndUpdate(project.departmentId, {
                $addToSet: {
                    freelancers: proposal.freelancerId,
                },
            });

            await project.save();
        }

        
    }

    res.status(200).json({
        ok: true,
        proposal
    });
});

module.exports = { declareReadiness , createProposal  , readProposalById , deleteProposal , getProposalStatusLabel , getProposalsForProject , reviewProposal};