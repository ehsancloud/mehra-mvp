// Runs after an express-validator chain on a route; turns any failure
// into a single consistent 422 response. ASVS V5.1 - never trust req.body directly.
const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(422, "Validation failed", errors.array()));
  }
  next();
};

module.exports = validate;
