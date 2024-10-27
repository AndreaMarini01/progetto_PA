import { Router } from 'express';
import {authenticationWithJWT} from "../middleware/authMiddleware";
import moveController from "../controllers/moveController";

/**
 * Router per le rotte relative alle mosse di gioco.
 *
 * Questo router gestisce le operazioni legate all'esecuzione delle mosse in una partita.
 * Fornisce un endpoint per eseguire una nuova mossa, protetto tramite autenticazione JWT.
 */

const router = Router();

/**
 * @route POST /new-move
 * @description Esegue una nuova mossa in una partita.
 * @access Riservato agli utenti autenticati.
 *
 * Middleware utilizzati:
 * - `authenticationWithJWT`: Verifica la presenza e la validità di un token JWT.
 *
 * Controller:
 * - `MoveController.executeMove`: Gestisce la logica per l'esecuzione di una mossa.
 */

router.post('/new-move', authenticationWithJWT, moveController.executeMove);
router.get('/game/:gameId/moves', authenticationWithJWT, moveController.getMoveHistory);


export default router;
