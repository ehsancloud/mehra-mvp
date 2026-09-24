const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/security");
const { register, login, refresh , registerRole, getMyProfile, updateUser, getUsers, getUserDirectory, getDeptUserDirectory, getUserProfile } = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  [
    body("firstName").isString().trim().notEmpty(),
    body("lastName").isString().trim().notEmpty(),
    body("username").isString().trim().isLength({ min: 3 }),
    body("email").isEmail().normalizeEmail(),
    body("phone").isString().trim().notEmpty(),
    body("nationalCode").isString().trim().notEmpty(),
    body("password").isString().isLength({ min: 8 }), // ASVS V2.1.1 - minimum length
    body("birthDate").isString(),
    body("province").isString(),
    body("city").isString(),
    body("education").isString(),
  ],
  validate,
  register,
);
router.post(
  "/register-role",
  protect,
  [
    body("role").isIn(["freelancer", "employer", "supervisor"]),
  ],
  validate,
  registerRole,
)
router.post(
  "/login",
  authLimiter,
  [body("username").isString().trim().notEmpty(), body("password").isString().notEmpty()],
  validate,
  login,
);



router.post("/refresh", [body("refreshToken").isString().notEmpty()], validate, refresh);




// Admin department management org-chart
router.get(
  "/users/department-directory",
  protect,
  authorize("admin"),
  getDeptUserDirectory
);
router.get(
  "/users/directory",
  protect,
  authorize("admin"),
  getUserDirectory
);
router.get(
  "/users",
  protect,
  authorize("admin","supervisor"),
  getUsers
);


// Get a specific user's profile
router.get(
  "/users/:id",
  protect,
  getUserProfile
);



router.get(
  "/me",
  protect,
  getMyProfile
);
router.put(
  "/users/:id",
  protect,
  authorize("admin"),
  updateUser
);



module.exports = router;
