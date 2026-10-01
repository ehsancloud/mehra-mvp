// این فایل قبلا با import (ES Module) نوشته شده بود که با پروژه‌ی
// CommonJS (بدون "type":"module" در package.json) اصلا کار نمی‌کرد -
// هر require() از این فایل بلافاصله SyntaxError می‌داد.
const Department = require("../models/Department");
const Proposal = require("../models/Proposal");

const resolveDepartmentName = async (departmentId) => {
  const department = await Department.findById(departmentId).select("name").lean();
  return department ? department.name : departmentId;
};

const resolveDepartmentId = async (name) => {
  const department = await Department.findOne({ name }).select("_id").lean();
  return department ? department._id : name;
};

const getProposalsForProjectSync = async (projectId) => {
  return await Proposal.find({ projectId }).lean();
};

const LEVEL_LABELS = { a: "سطح A", b: "سطح B", c: "سطح C" };
const getLevelLabel = (level) => LEVEL_LABELS[level] || level;

module.exports = {
  resolveDepartmentName,
  resolveDepartmentId,
  getProposalsForProjectSync,
  getLevelLabel,
};
