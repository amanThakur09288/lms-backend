/**
 * Generic Joi-validation middleware.
 * source: "body" (default), "params", or "query" — which part of the request to validate.
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details.map((d) => d.message).join(", "),
      });
    }
    req[source] = value;
    next();
  };
}

module.exports = validate;