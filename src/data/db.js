// In-memory copy of db.json, acting as a mock database for the whole app.
//
// TODO(API): this entire file (db.json + db.js + api.js) exists only to
// simulate a backend during frontend development. When wiring up the real
// backend:
//   1. Delete db.json and this in-memory store.
//   2. Keep api.js's function names/signatures/return shapes as the contract
//      - swap each function body for a real fetch()/axios call to the
//      matching REST (or GraphQL) endpoint.
//   3. Every screen already calls api.js functions and awaits them, so no
//      component code should need to change.
import rawDb from "./db.json";

// Deep clone so callers can freely mutate what they get back without
// corrupting the shared "database". A real backend would not have this
// problem since every request already returns a fresh payload.
const clone = (value) => JSON.parse(JSON.stringify(value));

// Single mutable in-memory store, seeded from the JSON file. Mutating
// functions in api.js (create/update/delete) write back into this object,
// so changes persist for the lifetime of the tab (but reset on reload -
// a real database is obviously durable).
let store = clone(rawDb);

export const getStore = () => store;

export const resetStore = () => {
  store = clone(rawDb);
};

export const readCollection = (key) => clone(store[key]);

export const writeCollection = (key, value) => {
  store[key] = value;
};

export default store;
