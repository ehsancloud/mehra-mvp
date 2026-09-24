// مدل تسک‌های تخته کانبان فریلنسر (deposited / suggestions / completed)
const mongoose = require("mongoose");
// check out 
// feelancer if column was suggestions can see all projects that the level and availbility was ok and if it was deposited or completed only see it if it was === freelancerId
const taskSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    employerId : { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    column: {
      type: String,
      enum: ["deposited", "suggestions", "completed"],
      required: true,
    },
    title: { type: String, required: true },
    department: { type: String }, // نام دپارتمان به‌صورت متن برای نمایش سریع در کارت
    startDate: { type: Date },
    lastUpdate: { type: Date, default: Date.now },
    employerApproval: { type: String , enum : ["approved" , "rejected" , "under review"]}, // تایید شده // در انتظار بررسی // رد شده
    approvalStatus: { type: String, enum: ["approved", "rejected", "under review"] }, // project stage // تایید شده // در انتظار بررسی // رد شده
    employerApprovalDate: { type: Date },
    statusText: { type: String , enum: ["open", "active", "completed"]}, // پیشنهاد شده / در حال اجرا / انجام شده
    relatedTicketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
    duration: { type: String },
    settlementStatus: { type: String , enum : ["Awaiting" , "Settled"] }, // در انتظار توسیه / تسویه شده
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
