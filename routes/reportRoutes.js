const express = require("express");
const router = express.Router();
const {
  generateReportPdf,
  previewReport,
} = require("../controllers/reportController");

router.post("/preview", previewReport);
router.post("/generate-pdf", generateReportPdf);

module.exports = router;
