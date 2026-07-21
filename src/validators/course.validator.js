// src/validators/course.validator.js
const Joi = require("joi");

const createCourseSchema = Joi.object({
  title: Joi.string().min(5).max(120).required(),
  subtitle: Joi.string().max(160).allow("").optional(),
  description: Joi.string().min(20).required(),
  thumbnailUrl: Joi.string().uri().allow("").optional(),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().min(5).max(120),
  subtitle: Joi.string().max(160).allow(""),
  description: Joi.string().min(20),
  thumbnailUrl: Joi.string().uri().allow(""),
  status: Joi.string().valid("draft", "published"),
}).min(1);

const sectionSchema = Joi.object({
  title: Joi.string().min(2).max(120).required(),
});

const reorderSectionsSchema = Joi.object({
  orderedSectionIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

const videoUploadMetaSchema = Joi.object({
  title: Joi.string().min(2).max(160).required(),
  isPreview: Joi.string().valid("true", "false").optional(),
});

const videoLinkSchema = Joi.object({
  title: Joi.string().min(2).max(160).required(),
  videoUrl: Joi.string().uri().required(),
  sourceType: Joi.string().valid("YOUTUBE", "DRIVE", "EXTERNAL").optional(),
  isPreview: Joi.boolean().optional(),
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  sectionSchema,
  reorderSectionsSchema,
  videoUploadMetaSchema,
  videoLinkSchema,
};