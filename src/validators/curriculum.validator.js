const Joi = require("joi");

const quizOptionSchema = Joi.object({
  text: Joi.string().min(1).required(),
  isCorrect: Joi.boolean().required(),
});

const quizQuestionSchema = Joi.object({
  text: Joi.string().min(3).required(),
  type: Joi.string().valid("mcq", "true_false", "multi_select").required(),
  points: Joi.number().min(1).max(100).required(),
  options: Joi.array().items(quizOptionSchema).min(2).required(),
});

const addQuizSchema = Joi.object({
  title: Joi.string().min(2).max(160).required(),
  passPercentage: Joi.number().min(1).max(100).required(),
  timeLimitMin: Joi.number().min(1).allow(null).optional(),
  questions: Joi.array().items(quizQuestionSchema).min(1).required(),
});

const addAssignmentSchema = Joi.object({
  title: Joi.string().min(2).max(160).required(),
  instructions: Joi.string().min(5).required(),
  submissionType: Joi.string().valid("file", "link", "text").required(),
  graded: Joi.boolean().optional(),
});

const addNoteSchema = Joi.object({
  title: Joi.string().min(2).max(160).required(),
  content: Joi.string().min(1).required(),
  attachmentUrl: Joi.string().uri().allow("").optional(),
});

module.exports = { addQuizSchema, addAssignmentSchema, addNoteSchema };