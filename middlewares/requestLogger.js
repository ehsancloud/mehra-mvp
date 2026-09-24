// سیستم گزارش‌گیری از هر اتفاقی که در سامانه رخ می‌دهد.
// Two layers per request: winston (operational log files) + a persisted
// Log document in MongoDB (queryable audit trail: who did what, when, from where).
const logger = require("../utils/logger");
const { Log } = require("../models");

const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", async () => {
    const duration = Date.now() - start;
    const entry = {
      action: `${req.method} ${req.originalUrl.split("?")[0]}`,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      user: req.user ? req.user._id : null,
      message: `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
    };
    logger.info(entry.message, entry);
    try {
      await Log.create(entry);
    } catch (err) {
      logger.error("Failed to persist audit log", { error: err.message });
    }
  });
  next();
};

module.exports = requestLogger;
