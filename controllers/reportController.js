const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Project = require("../models/Project");
const jalaali = require("jalaali-js");

const parseJalaliToGregorian = (jalaliDateStr) => {
  if (!jalaliDateStr) return null;
  const parts = jalaliDateStr.split("/");
  if (parts.length !== 3) return null;
  const jy = parseInt(parts[0], 10);
  const jm = parseInt(parts[1], 10);
  const jd = parseInt(parts[2], 10);
  
  try {
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
    return new Date(gy, gm - 1, gd);
  } catch (err) {
    return null;
  }
};

const previewReport = asyncHandler(async (req, res) => {
  const { type, projectStatus, paymentStatus, dateBasis, fromDate, toDate } = req.body;

  let query = {};

  // Status mapping
  if (projectStatus && projectStatus !== "همه وضعیت‌ها") {
    if (projectStatus === "در حال انجام") query.stage = "active";
    else if (projectStatus === "خاتمه یافته") query.stage = "completed";
    else if (projectStatus === "بایگانی") query.stage = "archived";
  }

  // Date filtering
  const fromG = parseJalaliToGregorian(fromDate);
  const toG = parseJalaliToGregorian(toDate);
  
  if (fromG || toG) {
    let dateField = "createdAt";
    if (dateBasis === "تحویل نهایی") dateField = "deadline";
    else if (dateBasis === "تاریخ شروع") dateField = "startDate";

    query[dateField] = {};
    if (fromG) {
      query[dateField].$gte = fromG;
    }
    if (toG) {
      toG.setHours(23, 59, 59, 999);
      query[dateField].$lte = toG;
    }
    
    if (Object.keys(query[dateField]).length === 0) {
      delete query[dateField];
    }
  }

  // Execute query
  const projects = await Project.find(query)
    .populate("employerId", "firstName lastName")
    .populate("supervisorId", "firstName lastName")
    .sort({ createdAt: -1 })
    .lean();

  let filteredProjects = projects;

  // Payment filtering
  if (paymentStatus && paymentStatus !== "همه وضعیت‌ها") {
    filteredProjects = filteredProjects.filter(p => {
      const budget = p.budget || p.proposalBudget || 0;
      const paid = p.paidAmount || 0;
      
      if (paymentStatus === "تسویه شده") return paid >= budget && budget > 0;
      if (paymentStatus === "تسویه نشده") return paid < budget;
      if (paymentStatus === "پیش‌پرداخت") return paid > 0 && paid < budget;
      return true;
    });
  }

  // Calculate summary
  let totalBudget = 0;
  let totalProjects = filteredProjects.length;

  const items = filteredProjects.map(p => {
    const budget = p.budget || p.proposalBudget || 0;
    totalBudget += budget;
    
    return {
      projectId: p._id,
      title: p.title,
      status: p.stage === "active" ? "در حال انجام" : p.stage === "completed" ? "خاتمه یافته" : p.stage === "archived" ? "بایگانی" : "نامشخص",
      budget: budget,
      paidAmount: p.paidAmount || 0,
      employer: p.employerId ? `${p.employerId.firstName || ""} ${p.employerId.lastName || ""}`.trim() : "تعیین نشده",
      supervisor: p.supervisorId ? `${p.supervisorId.firstName || ""} ${p.supervisorId.lastName || ""}`.trim() : "تعیین نشده",
      deadline: p.deadline ? (typeof p.deadline === "string" && !p.deadline.includes("-") ? p.deadline : new Date(p.deadline).toISOString()) : null,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null
    };
  });

  const avgBudget = totalProjects > 0 ? Math.round(totalBudget / totalProjects) : 0;

  res.status(200).json({
    ok: true,
    report: {
      type: type || "custom",
      generatedAt: new Date().toISOString(),
      summary: {
        totalProjects,
        totalBudget,
        avgBudget
      },
      items
    }
  });
});

module.exports = { previewReport };
