const asyncHandler = require("../utils/asyncHandler");
const courseService = require("../services/course.service");

const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body);
  res.status(201).json({ success: true, data: course });
});

const listCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.listCourses();
  res.status(200).json({ success: true, data: courses });
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.courseId);
  res.status(200).json({ success: true, data: course });
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.courseId, req.body);
  res.status(200).json({ success: true, data: course });
});

const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.courseId);
  res.status(200).json({ success: true, data: null });
});

module.exports = { createCourse, listCourses, getCourse, updateCourse, deleteCourse };