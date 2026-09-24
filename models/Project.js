// مدل پروژه - قلب اصلی سیستم
// payments و reviews به‌صورت subdocument تعبیه شدن (نه Collection جدا)
// چون همیشه با خود پروژه خونده و نوشته میشن، دقیقاً مثل db.json فعلی.
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true },
);

const reviewSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["employer", "supervisor" , "admin"], required: true },
    raterName: { type: String },
    initial: { type: String },
    stars: { type: Number, min: 1, max: 5, required: true },
    text: { type: String },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    
    priority: { type: String, required: true }, // مقدارش از enum ثابت priorities میاد (زیاد/متوسط/کم)
    level: { type: String, enum: ["a", "b", "c"], default:"c" },
    budget: { type: Number, required: true },
    proposalBudget : { type : Number , default : 0 },
    paidAmount: { type: Number, default: 0 },
    deadline: { type: Date, required: true },

    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancersId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    stage: {
      type: String,
      enum: ["open", "active", "completed"],
      default: "open",
    },
    status: { type: String, default: null }, // مثلاً awaiting_submission / closed

    isSuperProject: { type: Boolean, default: false },
    subProjectsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], // self-reference

    progress: { type: Number, default: 0, min: 0, max: 100 },
    ticketIds: [
      {
        ticketId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ticket",
          required: true,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    editCount: { type: Number, default: 1 }, // how many times the project has been edited after creation

    payments: [paymentSchema],
    reviews: [reviewSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);



// ----> status : در حال برسی ,در حال انجام ,  درخواست اصلاحیه, خاتمه یافته , تایید خروجی کارفرما,پیشنهاد شده
