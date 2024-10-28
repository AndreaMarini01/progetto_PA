import express from 'express';
import gameController from '../controllers/gameController';
import { authenticationWithJWT } from '../middleware/authMiddleware';

/**
 * Router per le rotte relative ai giochi.
 *
 * Questo router gestisce le operazioni legate alla creazione e alla gestione delle partite.
 * Fornisce un endpoint per creare una nuova partita, protetto tramite autenticazione JWT.
 */

const router = express.Router();

/**
 * @route POST /new-game
 * @description Crea una nuova partita.
 * @access Riservato agli utenti autenticati.
 *
 * Middleware utilizzati:
 * - `authenticationWithJWT`: Verifica la presenza e la validità di un token JWT.
 *
 * Controller:
 * - `createGameController`: Gestisce la logica per la creazione di una nuova partita.
 */

router.post('/create/new-game', authenticationWithJWT, gameController.createGame);
router.post('/abandon-game/:gameId', authenticationWithJWT, gameController.abandonGame)
router.get('/game-status/:gameId', authenticationWithJWT, gameController.evaluateGameStatus)
router.get('/completed-games', authenticationWithJWT, gameController.getCompletedGames)

export default router;
