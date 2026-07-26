// Canonical ticket status codes, as stored in the database. api.js maps
// these to the Persian label below before handing a ticket to the UI, so
// every screen that lists tickets (freelancer/employer, widgets and full
// pages) stays in sync if a status string ever changes on the backend.
export const TICKET_STATUS_CODES = {
  PENDING: "pending",
  IN_REVIEW: "in_review",
  REPLIED: "replied",
  ARCHIVED: "archived",
  CLOSED: "closed",
};

export const TICKET_STATUS_LABELS = {
  [TICKET_STATUS_CODES.PENDING]: "در انتظار بررسی",
  [TICKET_STATUS_CODES.IN_REVIEW]: "در حال بررسی",
  [TICKET_STATUS_CODES.REPLIED]: "پاسخ داده شده",
  [TICKET_STATUS_CODES.ARCHIVED]: "بایگانی شده",
  [TICKET_STATUS_CODES.CLOSED]: "بسته شده",
};

// Kept for any code still comparing against the display label directly.
export const TICKET_STATUS = {
  PENDING: TICKET_STATUS_LABELS.pending,
  REPLIED: TICKET_STATUS_LABELS.replied,
};

// Puts tickets that already have a reply at the top of the list (like a
// messenger inbox bumping a conversation up when a new message arrives).
// Backend can send tickets in any order - this only controls display order.
// TODO(API): once tickets carry a real timestamp, sort each group
// (replied / pending) by that timestamp, newest first.
export const sortTicketsByActivity = (tickets) => {
  return [...tickets].sort((a, b) => {
    const aReplied = a.status === TICKET_STATUS.REPLIED ? 1 : 0;
    const bReplied = b.status === TICKET_STATUS.REPLIED ? 1 : 0;
    return bReplied - aReplied;
  });
};

// Shared red/green status color used by ticket row cards.
export const getTicketStatusColor = (status) =>
  status === TICKET_STATUS.REPLIED ? "text-green-600" : "text-[#b90000]";
