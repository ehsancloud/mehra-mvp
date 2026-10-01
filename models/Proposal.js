// مدل پیشنهاد/درخواست فریلنسر برای یک پروژه باز (open)
const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    proposedCost: { type: Number , required:true },
    note: { type: String  , default : "i have a proposal for this project!"},
  },
  { timestamps: { createdAt: "submittedAt", updatedAt: true } },
);

// جلوگیری از ثبت دو پیشنهاد از یک فریلنسر برای یک پروژه
proposalSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });

module.exports = mongoose.model("Proposal", proposalSchema);
