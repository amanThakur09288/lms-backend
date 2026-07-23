const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { listPublishedCourses, getPublishedCourse } = require("../controllers/publicCourse.controller");

router.use(authMiddleware);

router.get("/", listPublishedCourses);
router.get("/:courseId", getPublishedCourse);

module.exports = router;