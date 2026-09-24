const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Task = require("../models/Task");
const Project = require("../models/Project");

const createTask = asyncHandler(async (req , res)=>{
    const {
        projectId, freelancerId, employerId, column, title, department,
        startDate, duration, relatedTicketId,
    } = req.body;
    const task = await Task.create({
        projectId, freelancerId, employerId, column, title, department,
        startDate, duration, relatedTicketId,
    });
    res.status(201).json(task);
});

const getTasks = asyncHandler(async (req, res) => {
    const { freelancerId, columns } = req.query;

    const filter = {};

    if (freelancerId) {
        filter.freelancerId = freelancerId;
    }

    if (columns) {
        filter.column = {
            $in: columns.split(",")
        };
    }

    const tasks = await Task.find(filter);

    res.status(200).json(tasks);
});

// req.user.role != "user"
const getTaskBoard = asyncHandler(async (req, res) => {
    const { freelancerId , employerId } = req.query;
    const filter = {};

    // A freelancer only ever sees their own board, regardless of what
    // (if anything) they pass in the query string.
    if (req.user.role === "freelancer") {
        filter.freelancerId = req.user._id;
    } else if (freelancerId && req.user.role !== "employer") {
        filter.freelancerId = freelancerId;
    }

    if (req.user.role === "employer") {
        filter.employerId = req.user._id;
    } else if (employerId && req.user.role !== "freelancer") {
        filter.employerId = employerId;
    }

    const tasks = await Task.find(filter);

    const toCardShape = (task) => ({
        id: task._id,
        title: task.title,
        department: task.department,
        start_date: task.startDate,
        last_update: task.lastUpdate,
        duration: task.duration,
        employerApproval: task.employerApproval,
        approvalStatus : task.approvalStatus,
        statusText: task.statusText,
        relatedTicketId: task.relatedTicketId,
    });

    res.status(200).json({
        deposited: tasks
            .filter(task => task.column === "deposited")
            .map(toCardShape),

        suggestions: tasks
            .filter(task => task.column === "suggestions")
            .map(toCardShape),

        completed: tasks
            .filter(task => task.column === "completed")
            .map(toCardShape),
    });
});

// authorize("employer", "supervisor", "admin")
const getEmployerTaskReports = asyncHandler(async (req, res) => {

    let { employerId } = req.query;

    // Employer can only see their own tasks
    if (req.user.role === "employer") {
        employerId = req.user._id;
    }

    const filter = {};

    if (employerId) {

        const projects = await Project.find({
            employerId
        }).select("_id");

        const projectIds = projects.map(
            project => project._id
        );

        filter.projectId = {
            $in: projectIds
        };
    }

    const tasks = await Task.find(filter);

    res.status(200).json({
        deposited: tasks.filter(
            task => task.column === "deposited"
        ),

        completed: tasks.filter(
            task => task.column === "completed"
        ),
    });
});



module.exports = {createTask , getTasks ,  getTaskBoard , getEmployerTaskReports};
