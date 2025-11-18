import express from 'express';
import { getAll, update } from '../controller/userController.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await getAll(req.query)
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
        const result = await update(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;