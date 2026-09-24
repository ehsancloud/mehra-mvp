// Canonical project workflow status codes, as stored in the database and
// returned by the API. These are the values api.js compares against - the
// frontend never compares against the Persian label directly, so the
// backend is free to send these exact strings without worrying about
// frontend copy changes breaking anything.
export const PROJECT_STATUS = {
  PENDING: "pending",
  AWAITING_SUBMISSION: "awaiting_submission",
  IN_REVIEW: "in_review",
  APPROVED: "approved",
  REVISION_REQUESTED: "revision_requested",
  CLOSED: "closed",
};

// Persian label shown to the user for each status code above.
export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.PENDING]: "در انتظار بررسی",
  [PROJECT_STATUS.AWAITING_SUBMISSION]: "در انتظار ارسال کار",
  [PROJECT_STATUS.IN_REVIEW]: "در حال بررسی",
  [PROJECT_STATUS.APPROVED]: "تایید شده",
  [PROJECT_STATUS.REVISION_REQUESTED]: "درخواست اصلاحیه",
  [PROJECT_STATUS.CLOSED]: "مختومه",
};

// Simplified status text shown on the employer's project list/details
// screens, which only distinguish "still running" from "finished" instead
// of the full granular workflow above.
export const EMPLOYER_STAGE_LABELS = {
  open: "در انتظار شروع",
  active: "در حال انجام",
  completed: "خاتمه یافته",
  archived: "خاتمه یافته",
};

// Badge color per status label. Falls back to the "approved" style for any
// value the frontend doesn't recognize yet, so a new backend status never
// breaks the UI.
const STATUS_STYLES = {
  [PROJECT_STATUS_LABELS[PROJECT_STATUS.PENDING]]: "bg-[#e1effe] text-[#1e40af]",
  [PROJECT_STATUS_LABELS[PROJECT_STATUS.AWAITING_SUBMISSION]]: "bg-[#fef3c7] text-[#92400e]",
  [PROJECT_STATUS_LABELS[PROJECT_STATUS.IN_REVIEW]]: "bg-[#e1effe] text-[#1e40af]",
  [PROJECT_STATUS_LABELS[PROJECT_STATUS.APPROVED]]: "bg-[#def7ec] text-[#03543f]",
  [PROJECT_STATUS_LABELS[PROJECT_STATUS.REVISION_REQUESTED]]: "bg-[#fde8e8] text-[#9b1c1c]",
  [PROJECT_STATUS_LABELS[PROJECT_STATUS.CLOSED]]: "bg-[#e5e7eb] text-[#374151]",
};

export const getProjectStatusStyle = (statusLabel) =>
  STATUS_STYLES[statusLabel] ||
  STATUS_STYLES[PROJECT_STATUS_LABELS[PROJECT_STATUS.APPROVED]];
