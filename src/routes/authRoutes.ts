import express from 'express';
import { login } from '../controllers/authController'; // Importa il controller

const router = express.Router();

// Definisci la rotta di login
router.post('/login', login);

export default router;

