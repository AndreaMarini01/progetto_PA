import { Router } from 'express';
import MoveController from '../controllers/moveController';
import {authenticationWithJWT} from "../middleware/authMiddleware";

const router = Router();

// Definisci la rotta per eseguire una mossa
router.post('/new-move', authenticationWithJWT, MoveController.executeMove);

export default router;
