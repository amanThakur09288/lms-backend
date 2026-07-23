const asyncHandler = require("../utils/asyncHandler");
const enrollmentService = require("../services/enrollment.service");

const enroll = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.enrollInCourse(req.user.id, req.params.courseId);
  res.status(201).json({ success: true, data: enrollment });
});

const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.listMyEnrollments(req.user.id);
  res.status(200).json({ success: true, data: enrollments });
});

const markComplete = asyncHandler(async (req, res) => {
  const result = await enrollmentService.markItemComplete(req.user.id, req.params.courseId, req.params.itemId);
  res.status(200).json({ success: true, data: result });
});

const unmarkComplete = asyncHandler(async (req, res) => {
  const result = await enrollmentService.unmarkItemComplete(req.user.id, req.params.courseId, req.params.itemId);
  res.status(200).json({ success: true, data: result });
});

module.exports = { enroll, getMyEnrollments, markComplete, unmarkComplete };