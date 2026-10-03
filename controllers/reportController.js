const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Project = require("../models/Project");
const jalaali = require("jalaali-js");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");

const normalizeDigits = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .trim();
};

const parseJalaliToGregorian = (jalaliDateStr) => {
  if (!jalaliDateStr) return null;
  const clean = normalizeDigits(jalaliDateStr);
  const parts = clean.split(/[/.-]/);
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

const toGregorianDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const str = normalizeDigits(String(val));
  if (/^1[34]\d{2}[/.-]/.test(str)) {
    return parseJalaliToGregorian(str);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

// Helper: Query projects and calculate report statistics
const getReportData = async (filters = {}) => {
  const {
    type,
    reportType,
    projectStatus,
    paymentStatus,
    dateBasis,
    fromDate,
    startDate,
    toDate,
    endDate,
  } = filters;

  const query = {};

  // Status mapping
  if (
    projectStatus &&
    projectStatus !== "همه وضعیت‌ها" &&
    projectStatus !== "همه وضعیت ها"
  ) {
    if (projectStatus === "در حال انجام") {
      query.$or = [{ stage: "active" }, { status: "در حال انجام" }];
    } else if (projectStatus === "خاتمه یافته") {
      query.$or = [{ stage: "completed" }, { status: "خاتمه یافته" }];
    } else if (projectStatus === "بایگانی") {
      query.$or = [{ stage: "archived" }, { status: "بایگانی" }];
    } else {
      query.$or = [{ status: projectStatus }, { stage: projectStatus }];
    }
  }

  // Execute query to get projects with employer and supervisor populated
  const projects = await Project.find(query)
    .populate("employerId", "firstName lastName username")
    .populate("supervisorId", "firstName lastName username")
    .sort({ createdAt: -1 })
    .lean();

  let filteredProjects = projects;

  // Date filtering
  const startStr = fromDate || startDate;
  const endStr = toDate || endDate;
  const fromG = parseJalaliToGregorian(startStr);
  const toG = parseJalaliToGregorian(endStr);
  if (toG) {
    toG.setHours(23, 59, 59, 999);
  }

  if (fromG || toG) {
    filteredProjects = filteredProjects.filter((p) => {
      let targetDate;
      if (dateBasis === "تحویل نهایی") {
        targetDate = toGregorianDate(p.deadline);
      } else if (dateBasis === "تاریخ شروع") {
        targetDate = toGregorianDate(p.startDate || p.createdAt);
      } else {
        // "تاریخ ثبت پروژه" or default
        targetDate = toGregorianDate(p.createdAt);
      }

      if (!targetDate) return true;
      if (fromG && targetDate < fromG) return false;
      if (toG && targetDate > toG) return false;
      return true;
    });
  }

  // Payment filtering
  if (
    paymentStatus &&
    paymentStatus !== "همه وضعیت‌ها" &&
    paymentStatus !== "همه وضعیت ها"
  ) {
    filteredProjects = filteredProjects.filter((p) => {
      const budget =
        Number(p.budget !== undefined ? p.budget : p.proposalBudget) || 0;
      const paid = Number(p.paidAmount) || 0;

      if (paymentStatus === "تسویه شده") return paid >= budget && budget > 0;
      if (paymentStatus === "تسویه نشده") return paid === 0 || paid < budget;
      if (paymentStatus === "پیش‌پرداخت") return paid > 0 && paid < budget;
      return true;
    });
  }

  // Calculate summary and map items
  let totalBudget = 0;
  let totalPaid = 0;
  const totalProjects = filteredProjects.length;

  const items = filteredProjects.map((p) => {
    const budget =
      Number(p.budget !== undefined ? p.budget : p.proposalBudget) || 0;
    const paidAmount = Number(p.paidAmount) || 0;
    totalBudget += budget;
    totalPaid += paidAmount;

    const employerName = p.employerId
      ? `${p.employerId.firstName || ""} ${p.employerId.lastName || ""}`.trim() ||
        p.employerId.username ||
        "کارفرما"
      : "تعیین نشده";

    const supervisorName = p.supervisorId
      ? `${p.supervisorId.firstName || ""} ${p.supervisorId.lastName || ""}`.trim() ||
        p.supervisorId.username ||
        "ناظر"
      : "تعیین نشده";

    const statusLabel =
      p.status ||
      (p.stage === "active"
        ? "در حال انجام"
        : p.stage === "completed"
        ? "خاتمه یافته"
        : p.stage === "archived"
        ? "بایگانی"
        : "در انتظار");

    let displayDeadline = p.deadline || "—";
    if (
      typeof p.deadline === "string" &&
      (p.deadline.includes("T") || p.deadline.includes("-"))
    ) {
      try {
        displayDeadline = new Date(p.deadline).toLocaleDateString("fa-IR");
      } catch (e) {}
    }

    return {
      projectId: p._id,
      title: p.title || "بدون عنوان",
      status: statusLabel,
      budget,
      paidAmount,
      employer: employerName,
      supervisor: supervisorName,
      deadline: displayDeadline,
      createdAt: p.createdAt
        ? new Date(p.createdAt).toLocaleDateString("fa-IR")
        : "—",
    };
  });

  const avgBudget =
    totalProjects > 0 ? Math.round(totalBudget / totalProjects) : 0;

  return {
    reportType: type || reportType || "custom",
    startDate: startStr || "ابتدای دوره",
    endDate: endStr || "تاکنون",
    summary: {
      totalProjects,
      totalBudget,
      totalPaid,
      avgBudget,
    },
    items,
  };
};

const previewReport = asyncHandler(async (req, res) => {
  const reportData = await getReportData(req.body);

  res.status(200).json({
    ok: true,
    report: {
      type: reportData.reportType,
      generatedAt: new Date().toISOString(),
      summary: reportData.summary,
      items: reportData.items,
    },
  });
});

const generateReportPdf = asyncHandler(async (req, res) => {
  const reportData = await getReportData(req.body);

  const templatePath = path.join(__dirname, "../views/reportTemplate.ejs");
  const html = await ejs.renderFile(templatePath, {
    reportTitle:
      req.body.type || req.body.reportType || "گزارش پروژه‌های سیستم",
    startDate: reportData.startDate,
    endDate: reportData.endDate,
    currentDate: new Date().toLocaleDateString("fa-IR"),
    projects: reportData.items,
    totalAmount: reportData.summary.totalBudget,
    totalPaid: reportData.summary.totalPaid,
    totalProjects: reportData.summary.totalProjects,
    avgBudget: reportData.summary.avgBudget,
  });

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
  });

  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="report.pdf"',
    "Content-Length": pdfBuffer.length,
  });

  res.end(pdfBuffer);
});

module.exports = {
  previewReport,
  generateReportPdf,
};
