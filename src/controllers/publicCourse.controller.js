const asyncHandler = require("../utils/asyncHandler");
const courseService = require("../services/course.service");

const listPublishedCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.listPublishedCourses();
  res.status(200).json({ success: true, data: courses });
});

const getPublishedCourse = asyncHandler(async (req, res) => {
  const course = await courseService.getPublishedCourseById(
    req.params.courseId,
    req.user.id,
  );
  res.status(200).json({ success: true, data: course });
});

module.exports = { listPublishedCourses, getPublishedCourse };
