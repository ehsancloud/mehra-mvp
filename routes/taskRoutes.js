const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");
const { createTask, getTasks, getTaskBoard, getEmployerTaskReports } = require("../controllers/taskController");

const router = express.Router();

// NOTE: this used to have three POST /create registrations - one wrongly
// wired to departmentController.createDepartment (copy-paste leftover)
// which silently shadowed this real handler since Express uses the first
// route that matches, and a second incomplete duplicate with no handler.
// Only this one is needed.
router.post("/create", protect, authorize("supervisor", "admin"), [
    body("column").isString().notEmpty().isIn(["deposited", "suggestions", "completed"]),
    body("title").isString().notEmpty(),
], validate, createTask);

router.get("/", protect, getTasks);
router.get("/getTaskBoard", protect, getTaskBoard);
router.get("/getEmployerTaskReports", protect, authorize("employer", "supervisor", "admin"), getEmployerTaskReports);

module.exports = router;
