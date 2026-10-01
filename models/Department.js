// مدل دپارتمان‌ها (مثل "طراحی لوگو"، "UI/UX" و ...)
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    employers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    supervisors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    freelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    projects : [ { type : mongoose.Schema.Types.ObjectId , ref : "Project" } ]
  },
  { timestamps: true },
);

module.exports = mongoose.model("Department", departmentSchema);
