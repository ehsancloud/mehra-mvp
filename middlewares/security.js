// Global security baseline, applied before any route.
// ASVS V1 (architecture), V5 (input handling), V13 (API/HTTP hardening).
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const corsOptions = {
  origin: (process.env.CORS_ORIGIN || "").split(",").filter(Boolean),
  credentials: true,
};

// ASVS V2.2.1 - throttle authentication endpoints against brute force / credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

const applySecurity = (app) => {
  app.use(helmet());
  app.use(cors(corsOptions));
  //app.use(mongoSanitize()); // strips $ and . from req.body/query/params - blocks NoSQL injection // attenction
  app.use(hpp()); // HTTP parameter pollution defense
  app.use(apiLimiter);
};

module.exports = { applySecurity, authLimiter };
