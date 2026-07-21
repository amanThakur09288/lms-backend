const asyncHandler = require("../utils/asyncHandler");
const sectionService = require("../services/section.service");

const addSection = asyncHandler(async (req, res) => {
  const section = await sectionService.addSection(req.params.courseId, req.body);
  res.status(201).json({ success: true, data: section });
});

const updateSection = asyncHandler(async (req, res) => {
  const section = await sectionService.updateSection(req.params.sectionId, req.body);
  res.status(200).json({ success: true, data: section });
});

const deleteSection = asyncHandler(async (req, res) => {
  await sectionService.deleteSection(req.params.sectionId);
  res.status(200).json({ success: true, data: null });
});

const reorderSections = asyncHandler(async (req, res) => {
  await sectionService.reorderSections(req.params.courseId, req.body.orderedSectionIds);
  res.status(200).json({ success: true, data: null });
});

module.exports = { addSection, updateSection, deleteSection, reorderSections };