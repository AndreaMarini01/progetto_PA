import express from 'express';
import { authenticationWithJWT } from '../middleware/authMiddleware';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware';
import { chargeTokens } from '../controllers/adminController';

/**
 * Router per le rotte amministrative.
 *
 * Questo router gestisce le operazioni riservate agli amministratori, come l'aggiornamento
 * dei token per i giocatori. Le rotte sono protette tramite middleware di autenticazione
 * e autorizzazione per garantire che solo gli amministratori autenticati possano accedervi.
 */

const router = express.Router();

/**
 * @route PUT /chargeTokens
 * @description Aggiorna i token di un giocatore.
 * @access Riservato agli amministratori autenticati.
 *
 * Middleware utilizzati:
 * - `authenticationWithJWT`: Verifica la presenza e la validità di un token JWT.
 * - `adminAuthMiddleware`: Verifica che l'utente autenticato abbia il ruolo di amministratore.
 *
 * Controller:
 * - `chargeTokens`: Gestisce l'aggiornamento dei token per il giocatore specificato.
 */

router.put('/chargeTokens', authenticationWithJWT, adminAuthMiddleware, chargeTokens);

export default router;

