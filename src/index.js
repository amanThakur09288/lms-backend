const env = require("./config/env");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const logger = require("./config/logger");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth.routes");

const app = express();
console.log("FRONTEND_URL =", process.env.FRONTEND_URL);
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  morgan(env.nodeEnv === "production" ? "combined" : "dev", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: "Too many attempts. Please try again later." },
});

app.use("/api/auth", authLimiter, authRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "LMS backend is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(`Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
});