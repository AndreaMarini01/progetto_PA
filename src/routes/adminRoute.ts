// src/routes/adminRoutes.ts
import express from 'express';
import { authenticationWithJWT } from '../middleware/authMiddleware';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware';
import { chargeTokens } from '../controllers/adminController';

const router = express.Router();

router.put('/chargeTokens', authenticationWithJWT, adminAuthMiddleware, chargeTokens);

export default router;

