import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { register, login, logout, getCurrentUser } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/current-user', authMiddleware, getCurrentUser);

export default router;

