// مدل دفتر مالی هر پروژه (مبالغ بلاک‌شده/آزادشده) که توسط ناظر مدیریت میشه
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String }, // (پولی که کارفرما میفرسته بلاک میشه سپس به فریلنسر آزاد میشه)در انتظار پرداخت (کافرما پرداخت کن) / پرداخت شده(به فریلنسر) / بلاک شده
    target: { type: String }, // نام گیرنده مبلغ
    targetId : {type: mongoose.Schema.Types.ObjectId, ref: "User" },
    state: {
      type: String,
      enum: ["paid", "blocked", "pending" ],
      required: true,
    },
  },
  { _id: true },
);

const financeProjectSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    blockedAmount: { type: Number, default: 0 },
    statusType: { type: String }, // مثلاً "جزئی" / "کامل" / "بلاک"     // جزئی : زمانی که آزادسازی به مبلغی به حساب فریلنسر شده باشد و کامل : زمانی که آزادسازی تمام مبلغ بلاک شده به فریلنسر انجام شود  بلاک : هزینه ای به فریلنسر داده نشده باشد
    transactions: [transactionSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("FinanceProject", financeProjectSchema);
