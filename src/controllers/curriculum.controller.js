const asyncHandler = require("../utils/asyncHandler");
const quizService = require("../services/quiz.service");
const assignmentService = require("../services/assignment.service");
const noteService = require("../services/note.service");
const itemService = require("../services/item.service");

const addQuiz = asyncHandler(async (req, res) => {
  const item = await quizService.addQuiz(req.params.sectionId, req.body);
  res.status(201).json({ success: true, data: item });
});

const addAssignment = asyncHandler(async (req, res) => {
  const item = await assignmentService.addAssignment(req.params.sectionId, req.body);
  res.status(201).json({ success: true, data: item });
});

const addNote = asyncHandler(async (req, res) => {
  const item = await noteService.addNote(req.params.sectionId, req.body);
  res.status(201).json({ success: true, data: item });
});

const deleteItem = asyncHandler(async (req, res) => {
  await itemService.deleteItem(req.params.itemId);
  res.status(200).json({ success: true, data: null });
});

module.exports = { addQuiz, addAssignment, addNote, deleteItem };