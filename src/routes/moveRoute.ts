/**
 * Modulo di routing `moveRoutes` per le operazioni di gestione delle mosse.
 *
 * Questo modulo definisce le rotte per eseguire nuove mosse e visualizzare lo storico delle mosse
 * per una partita specifica. Entrambe le rotte richiedono autenticazione tramite `authenticationWithJWT`.
 *
 * @requires express.Router - Router di Express per la gestione delle rotte.
 * @requires authenticationWithJWT - Middleware per autenticare l'utente tramite JWT.
 * @requires moveController - Controller per gestire le azioni sulle mosse.
 *
 * @route POST /new-move
 * @description Esegue una nuova mossa in una partita esistente. Richiede autenticazione.
 * @access Privato
 *
 * @route GET /game/:gameId/moves
 * @description Restituisce lo storico delle mosse per una partita specifica tramite `gameId`. Richiede autenticazione.
 * @access Privato
 *
 * @returns {JSON} - Informazioni sulla mossa appena eseguita o sulla cronologia delle mosse.
 */

import { Router } from 'express';
import {authenticationWithJWT} from "../middleware/authMiddleware";
import moveController from "../controllers/MoveController";

const router = Router();

router.post('/new-move', authenticationWithJWT, moveController.executeMove);
router.get('/game/:gameId/moves', authenticationWithJWT, moveController.getMoveHistory);


export default router;
