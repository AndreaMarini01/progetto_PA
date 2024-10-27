import express from 'express';
import { login } from '../controllers/authController';

/**
 * Router per le rotte di autenticazione.
 *
 * Questo router gestisce le operazioni relative all'autenticazione, come il login
 * degli utenti. Fornisce un endpoint per l'autenticazione che accetta le credenziali
 * dell'utente e restituisce un token JWT in caso di successo.
 */

const router = express.Router();

/**
 * @route POST /login
 * @description Esegue il login dell'utente.
 * @access Pubblico
 *
 * Controller:
 * - `login`: Gestisce l'autenticazione dell'utente e restituisce un token JWT.
 */

router.post('/login', login);

export default router;

