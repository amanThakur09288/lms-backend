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
const courseRoutes = require("./routes/course.routes");
const publicCourseRoutes = require("./routes/publicCourse.routes");
const userRoutes = require("./routes/user.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");

const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.ADMIN_FRONTEND_URL || "http://localhost:5173",
  process.env.STUDENT_FRONTEND_URL || "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
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
app.use("/api/admin/courses", courseRoutes);
app.use("/api/courses", publicCourseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/enrollments", enrollmentRoutes);

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