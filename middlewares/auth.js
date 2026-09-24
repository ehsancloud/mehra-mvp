// JWT verification + role-based access control (ASVS V3 session mgmt, V4 access control).
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { User } = require("../models");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authenticated");
  }
  const token = header.split(" ")[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }
  const user = await User.findById(payload.sub);
  if (!user || user.status !== "active") {
    throw new ApiError(401, "User no longer active");
  }
  req.user = user;
  next();
});

// Usage: router.delete("/:id", protect, authorize("admin", "supervisor"), controller)
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "Forbidden - insufficient role"));
  }
  next();
};

module.exports = { protect, authorize };
