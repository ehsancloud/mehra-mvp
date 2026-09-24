// سیستم گزارش‌گیری از هر اتفاقی که در سامانه رخ می‌دهد.
// Persisted audit trail - one document per request/event, written by
// middlewares/requestLogger.js. Kept separate from winston (which writes
// to log files) so this can be queried/filtered from an admin panel.
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true }, // e.g. "POST /api/auth/login"
    method: { type: String },
    path: { type: String },
    statusCode: { type: Number },
    ip: { type: String },
    userAgent: { type: String },
    message: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed }, // free-form extra context (never store passwords/tokens here)
  },
  { timestamps: true },
);

logSchema.index({ createdAt: -1 });
logSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Log", logSchema);
