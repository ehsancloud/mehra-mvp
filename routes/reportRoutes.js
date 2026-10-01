const express = require("express");
const router = express.Router();
const { generateReportPdf } = require("../controllers/reportController");

router.post("/generate-pdf", generateReportPdf);

module.exports = router;
