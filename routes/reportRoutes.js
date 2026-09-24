const router = require("express").Router();
const { protect, authorize } = require("../middlewares/auth");
const { previewReport } = require("../controllers/reportController");

router.post("/preview", protect, authorize("admin"), previewReport);

module.exports = router;
