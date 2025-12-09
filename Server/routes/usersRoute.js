import express from 'express';
import { getAll, update } from '../controller/userController.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        // ✅ Validate and sanitize query params to prevent MongoDB injection
        const allowedParams = ['page', 'limit', 'search', 'role'];
        const sanitizedQuery = {};

        for (const [key, value] of Object.entries(req.query)) {
            if (allowedParams.includes(key)) {
                // Ensure value is string or number, not object (prevents injection)
                if (typeof value === 'string' || typeof value === 'number') {
                    sanitizedQuery[key] = value;
                }
            }
        }

        const result = await getAll(sanitizedQuery);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// router.post('/', async (req, res, next) => {
//     try {
//         const result = await create(req.body);
//         res.status(201).json(result);
//     } catch (error) {
//         next(error);
//     }
// });

router.put('/:id', async (req, res, next) => {
    try {
        // Verify user is updating their own account or is admin
        if (req.params.id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You can only update your own account'
            });
        }

        // Prevent role escalation - only admins can change roles
        if (req.body.role && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: Only admins can change user roles'
            });
        }

        const result = await update(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;