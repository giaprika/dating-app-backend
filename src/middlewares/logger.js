// Logger middleware for request/response logging
const logger = (req, res, next) => {
  const start = Date.now();

  // Log incoming request
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`,
  );

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`,
    );
    return originalJson.call(this, data);
  };

  next();
};

const errorHandler = (err, req, res, next) => {
  console.error("ERROR");
  console.error(err.stack || err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};

export { errorHandler, logger };
