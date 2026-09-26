const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const { applySecurity } = require("./middlewares/security");
const requestLogger = require("./middlewares/requestLogger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const projectRoutes = require("./routes/projectRoutes");
const financeRoutes = require("./routes/financeProjectRoutes");
const notifRoutes = require("./routes/notificationRoutes");
const taskRoutes = require("./routes/taskRoutes");
const logRoutes = require("./routes/logRoutes");
const cors = require("cors");
const app = express();
app.use(cors({
    origin: [
        "https://firecamp.dev",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173"
    ],
    credentials: true
}));

//applySecurity(app); // includes the single cors() call - see CORS_ORIGIN in .env
app.use(express.json({ limit: "1mb" })); // ASVS V13 - cap request body size 
app.use(compression());
app.use(morgan("dev"));
app.use(requestLogger);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/uploads", uploadRoutes);
// TODO: mount remaining resource routes here as you build them:
app.use("/api/projects", projectRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/notifications" , notifRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/reports", require("./routes/reportRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
