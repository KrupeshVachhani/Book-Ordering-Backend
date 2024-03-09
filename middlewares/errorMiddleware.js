export const errorMiddleware = (err, req, res, next) => {
    if (!err || !err.message) {
      err = new Error("Internal Server Error");
      err.statusCode = 500;
    }
  
    err.statusCode = err.statusCode || 500;
  
    if (res && res.status) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
        satckTrace: err.stack,
      });
    } else {
      next(err);
    }
  };

export const asyncErrorHandler = (passedFunction) => (req, res, next) => {
    Promise.resolve(passedFunction(req, res, next)).catch(next);
  };
  