const asyncHandler = require("../utils/asyncHandler");
const { Log } = require("../models");

const getLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 30,
    search,
    method,
    statusCode,
    userId,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = {};

  // Text search across action, path, message
  if (search && search.trim()) {
    const q = search.trim();
    filter.$or = [
      { action: { $regex: q, $options: "i" } },
      { path: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }

  if (method) filter.method = method.toUpperCase();
  if (statusCode) filter.statusCode = parseInt(statusCode);
  if (userId) filter.user = userId;

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [logs, totalDocs] = await Promise.all([
    Log.find(filter)
      .populate("user", "firstName lastName username role")
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Log.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalDocs,
      totalPages: Math.ceil(totalDocs / limitNum),
    },
  });
});

module.exports = { getLogs };
