// Zip-only upload system. ASVS V12 (file/resource handling):
// - filename is randomized, never the user-supplied name (blocks path traversal)
// - both extension AND mimetype are checked (either alone is spoofable)
// - size is capped
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const ApiError = require("../utils/ApiError");

const ALLOWED_MIMES = [
  "application/zip", "application/x-zip-compressed", "application/octet-stream",
  "application/pdf",
  "image/jpeg", "image/png", "image/gif", "image/webp"
];

const ALLOWED_EXTS = [".zip", ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const randomName = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = ALLOWED_EXTS.includes(ext);
  const isAllowedMime = ALLOWED_MIMES.includes(file.mimetype);
  
  if (!isAllowedExt || !isAllowedMime) {
    return cb(new ApiError(400, "فرمت فایل مجاز نیست (فقط ZIP, PDF و تصاویر)"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (Number(process.env.UPLOAD_MAX_MB) || 20) * 1024 * 1024, files: 1 },
});

module.exports = upload;
