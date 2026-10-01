// Winston logger - structured operational logs (console in dev, files always).
// Separate from the Log Mongoose model: winston is for debugging/ops,
// the Log collection is the queryable audit trail.
//its for developing and debugging only its is not gonna save it in db
const winston = require("winston");
const path = require("path");

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, "../logs/error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(__dirname, "../logs/combined.log") }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

module.exports = logger;
