const mongoose = require("mongoose");

const ticketMessageSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    senderRole: {
      type: String,
      enum: ["freelancer", "employer", "supervisor", "admin"],
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: false }, // Made optional so users can send just files
    fileUrl: { type: String }, // Added
    isFinalFile: { type: Boolean, default: false }, // Added
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ticketMessageSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model("TicketMessage", ticketMessageSchema);