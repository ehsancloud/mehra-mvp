const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");
  res.status(201).json({
    message: "File uploaded successfully",
    file: {
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    },
  });
});

module.exports = { uploadFile };
