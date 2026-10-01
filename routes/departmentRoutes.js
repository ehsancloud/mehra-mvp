const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/security");
const { protect, authorize } = require("../middlewares/auth");
const { createDepartment, getDepartments , getDepartmentNames, updateDepartment,getDepartmentsStats, deleteDepartment, getDepartmentUserStats } = require("../controllers/departmentController");

const router = express.Router();


router.post("/create" , protect , authorize("admin"), [
    body("name").isString().notEmpty(),

] , validate , createDepartment)
router.get(
    "/",
    protect,
    getDepartments
);

router.get(
    "/names",
    protect,
    getDepartmentNames
);

router.put("/:id" , protect , authorize("admin") , updateDepartment);
router.delete("/:id" , protect , authorize("admin") , deleteDepartment);
router.get("/stats" , protect , authorize("admin") , getDepartmentsStats);
router.get("/user-stats/:departmentId" , protect , authorize("admin") , getDepartmentUserStats);

module.exports = router;