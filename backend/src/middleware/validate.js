export default function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message.replace(/"/g, '')
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    if (source === 'query') {
      try {
        Object.defineProperty(req, 'query', {
          value,
          writable: true,
          enumerable: true,
          configurable: true
        });
      } catch {
        for (const key of Object.keys(req.query || {})) {
          delete req.query[key];
        }
        Object.assign(req.query, value);
      }
    } else {
      req[source] = value;
    }
    next();
  };
}
