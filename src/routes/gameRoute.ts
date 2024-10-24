import express from 'express';
import { createGameController } from '../controllers/gameController';
import { authenticationWithJWT } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/new-game', authenticationWithJWT, createGameController);

export default router;
