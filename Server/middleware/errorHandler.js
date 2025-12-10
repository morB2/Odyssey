export function errorHandler(err, req, res, next) {
    // ✅ Sanitize error before logging - don't log full error object
    const safeError = {
        message: err.message,
        status: err.status,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };

    console.error("Error:", safeError);

    const status = err.status || 500;

    // ✅ Hide internal errors in production
    const message = process.env.NODE_ENV === 'production' && status === 500
        ? 'Internal Server Error'
        : (err.message || "Internal Server Error");

    res.status(status).json({
        success: false,
        message,
    });
}