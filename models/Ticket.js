// مدل تیکت پشتیبانی/درخواست، که می‌تونه بعداً به یک Project تبدیل بشه
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description : {type : String , required : true},
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" , required: true },
    priority: { type: String , required: true },
    status: {
      type: String,
      enum: ["pending", "replied", "closed"],
      default: "pending",
    },
    stage: {
      type: String,
      enum: ["current", "archived"],
      default: "current",
    },
    relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },

    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    lastUpdate: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

module.exports = mongoose.model("Ticket", ticketSchema);
