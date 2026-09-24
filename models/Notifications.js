const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["project", "ticket", "wallet"],
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        text: {
            type: String,
            required: true,
        },

        btnText: {
            type: String,
        },

        relatedProjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
        },

        relatedProjectPath: {
            type: String,
        },

        relatedTicketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
        },

        relatedTicketTitle: {
            type: String,
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Notification", notificationSchema);