export function adminMiddleware(req, res, next) {
    // Verify user exists and has admin role
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
}
