const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const { getLogs } = require("../controllers/logController");

const router = express.Router();

router.get("/", protect, authorize("admin"), getLogs);

module.exports = router;
