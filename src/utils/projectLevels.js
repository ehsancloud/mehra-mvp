// Project difficulty/trust tiers. "a" is the highest tier, "c" the lowest.
// A freelancer can access projects at their own tier or below, but not
// tiers above their own. These are the exact codes stored on both the
// user record (freelancer's own level) and the project record (required
// level), so they can be compared directly.
export const LEVEL_RANK = { a: 3, b: 2, c: 1 };

// Persian label shown for each level code (used on profile cards, proposal
// lists, etc). Keeping the mapping in one place means the "سطح ۱/۲/۳" text
// shown across different panels can never drift out of sync with each
// other or with the access-control codes above.
export const LEVEL_LABELS = { c: "سطح ۱", b: "سطح ۲", a: "سطح ۳" };

export const getLevelLabel = (levelCode) => LEVEL_LABELS[levelCode] || levelCode;

export const canAccessProjectLevel = (projectLevel, userLevel) =>
  LEVEL_RANK[projectLevel] <= LEVEL_RANK[userLevel];
