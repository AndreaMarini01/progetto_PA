/**
 * Modulo di routing `authRoute` per le operazioni di autenticazione.
 *
 * Questo modulo definisce le rotte di autenticazione per il login degli utenti.
 * Utilizza `authController` per gestire la logica di autenticazione.
 *
 * @requires express - Modulo Express per la gestione delle rotte.
 * @requires authController - Controller per gestire le azioni di autenticazione.
 *
 * @route POST /login
 * @description Autentica un utente e restituisce un token JWT se le credenziali sono valide.
 * @access Pubblico
 *
 * @returns {JSON} - Token JWT per l'accesso autenticato o un errore se le credenziali non sono valide.
 */

import express from 'express';
import authController from "../controllers/authController";

const router = express.Router();

router.post('/login', authController.login);

export default router;

