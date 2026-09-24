const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Ticket = require("../models/Ticket");
const TicketMessage = require("../models/TicketMessage")
const Department = require("../models/Department");
const Supervisor = require("../models/Supervisor");
const canSupervisorManageTicket = async (userId, ticket) => {
    const supervisor = await Supervisor.findOne({ userId });

    if (!supervisor) {
        throw new ApiError(403, "Supervisor profile not found");
    }

    const departments = await Department.find({
        name: { $in: supervisor.departments }
    }).select("_id");

    return departments.some((d) => d._id.equals(ticket.department));
};
const canUserAccessTicket = async (user, ticket) => {
    if (!ticket) {
        throw new ApiError(404, "Ticket not found");
    }

    // Admin can access everything
    if (user.role === "admin") {
        return true;
    }

    // Ticket owner can access their own ticket
    if (
        user.role === "user" ||
        user.role === "freelancer" ||
        user.role === "employer"
    ) {
        return ticket.userId.equals(user._id);
    }

    // Supervisor can access tickets in their departments
    if (user.role === "supervisor") {
        return canSupervisorManageTicket(user._id, ticket);
    }

    return false;
};
// we get req.params.id that is actually a ticket id
// const getTicketMessages = asyncHandler(async (req, res) => {
//     const ticket = await Ticket.findById(req.params.id);

//     const allowed = await canUserAccessTicket(req.user, ticket);

//     if (!allowed) {
//         throw new ApiError(403, "You're not authorized");
//     }

//     const ticketMessages = await TicketMessage.find({
//         ticket: req.params.id,
//     });

//     res.status(200).json(ticketMessages);
// });
// we get req.params.id that is actually a ticket id
const sendTicketMessage = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    const allowed = await canUserAccessTicket(req.user, ticket);
    
    if (!allowed) {
        throw new ApiError(403, "You're not authorized");
    }

    // Require EITHER text OR a fileUrl
    if ((!req.body.text || !req.body.text.trim()) && !req.body.fileUrl) {
        throw new ApiError(400, "Message text or file is required");
    }

    const newMessage = await TicketMessage.create({
        ticket: req.params.id,
        senderRole: req.user.role,
        sender: req.user._id,
        text: req.body.text || "",
        fileUrl: req.body.fileUrl,         // Added
        isFinalFile: req.body.isFinalFile, // Added
    });

    res.status(201).json(newMessage);
});

const deleteMessage = asyncHandler(async (req , res)=>{
    await TicketMessage.findByIdAndDelete(req.params.id2);
    res.status(200).json("Message has been deleted...");
})
const updateMessage = asyncHandler(async (req , res)=>{
    const ticketMessage = await TicketMessage.findByIdAndUpdate(
          req.params.id2,
          {
            $set: req.body,
          },
          { new: true }
        );
    res.status(200).json(ticketMessage);
})

module.exports = { sendTicketMessage , deleteMessage , updateMessage };
