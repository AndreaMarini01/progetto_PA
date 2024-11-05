/**
 * Modulo di routing `adminRoute` per le operazioni di amministrazione.
 *
 * Questo modulo definisce le rotte di amministrazione che richiedono autenticazione e permessi di amministratore.
 * Utilizza il middleware `authenticationWithJWT` per autenticare l'utente e `adminAuthMiddleware` per verificare
 * che l'utente abbia i permessi di amministratore.
 *
 * @requires express - Modulo Express per la gestione delle rotte.
 * @requires authenticationWithJWT - Middleware per autenticare l'utente tramite JWT.
 * @requires adminAuthMiddleware - Middleware per verificare i permessi di amministratore.
 * @requires AdminController - Controller per gestire le azioni amministrative.
 *
 * @route PUT /chargeTokens
 * @description Ricarica i token per un utente specificato.
 *   Richiede che l'utente sia autenticato come amministratore.
 * @access Admin
 *
 * @returns {JSON} - Un messaggio di conferma o un errore se i permessi non sono soddisfatti.
 */

import express from 'express';
import { authenticationWithJWT } from '../middleware/authMiddleware';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware';
import adminController from '../controllers/AdminController';

// Crea un router utilizzando il modulo express.Router()
const router = express.Router();

// Rotta di tipo put con middleware di autenticazione e middleware per il ruolo di admin
router.put('/chargeTokens', authenticationWithJWT, adminAuthMiddleware, adminController.chargeTokens);

export default router;

