// مدل پایه کاربر - فقط فیلدهای مشترک بین همه نقش‌ها اینجا هستن.
// فیلدهای اختصاصی هر نقش (مثل rateScore برای فریلنسر) در فایل‌های
// Freelancer.js / Employer.js با discriminator اضافه میشن، نه اینجا.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    uniqueId: { type: String, default : "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, unique: true },
    birthDate:{type : String , required : true},
    province: {type : String , required : true},
    city: {type : String , required : true},
    education: {type : String , required : true},
    nationalCode: { type: String, required: true, unique: true },
    // TODO(security): قبل از production حتماً با bcrypt هش بشه، هرگز خام ذخیره نشه
    password: { type: String, required: true, select: false },
    initial: { type: String },
    avatarColor: { type: String , default:"#0000FF" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    role: {
        type: String,
        enum: ["user", "freelancer", "employer", "supervisor", "admin"],
        default: "user",
    },
    income: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    skills: { type: Array },
    roles: {
      type: [String],
      default: ["user"],
      // Optional: Validate roles against allowed values
      enum: {
        values: ["user", "freelancer", "employer", "admin", "supervisor"],
        message: "{VALUE} is not a valid role",
      },
    }, // برچسب‌های نمایشی مثل "فریلنسر" برای UI
  },
  {
    timestamps: true
  },
);

module.exports = mongoose.model("User", userSchema);
