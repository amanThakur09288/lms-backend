const Joi = require("joi");

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(60),
  bio: Joi.string().max(500).allow(""),
  avatarUrl: Joi.string().uri().allow(""),
}).min(1);

module.exports = { updateProfileSchema };