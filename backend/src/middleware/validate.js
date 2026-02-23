const HttpError = require('../utils/httpError');

function validate(schema) {
  return (req, res, next) => {
    const payload = {
      body: req.body,
      params: req.params,
      query: req.query,
    };

    const options = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    const { error, value } = schema.validate(payload, options);

    if (error) {
      const details = error.details.map((detail) => detail.message.replace(/"/g, ''));
      next(new HttpError(400, details.join(', ')));
      return;
    }

    req.body = value.body || req.body;
    req.params = value.params || req.params;
    req.query = value.query || req.query;

    next();
  };
}

module.exports = validate;
