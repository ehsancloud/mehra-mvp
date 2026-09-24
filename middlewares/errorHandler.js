// Centralized error handling - ASVS V7.4: never leak stack traces outside development.
const logger = require("../utils/logger");

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });
  res.status(statusCode).json({
    message: err.message,
    details: err.details || undefined,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
