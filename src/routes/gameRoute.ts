/**
 * Modulo di routing `gameRoutes` per le operazioni di gestione delle partite.
 *
 * Questo modulo definisce le rotte per la creazione, gestione e visualizzazione delle partite,
 * incluso l'abbandono di una partita, il controllo dello stato, la visualizzazione delle partite concluse,
 * la classifica dei giocatori e l'ottenimento di un certificato di vittoria.
 * Alcune rotte richiedono autenticazione tramite `authenticationWithJWT`.
 *
 * @requires express - Modulo Express per la gestione delle rotte.
 * @requires authenticationWithJWT - Middleware per autenticare l'utente tramite JWT.
 * @requires gameController - Controller per gestire le azioni di gioco.
 *
 * @route POST /create/new-game
 * @description Crea una nuova partita. Richiede autenticazione.
 * @access Privato
 *
 * @route POST /abandon-game/:gameId
 * @description Permette al giocatore di abbandonare una partita specificata tramite `gameId`. Richiede autenticazione.
 * @access Privato
 *
 * @route GET /game-status/:gameId
 * @description Restituisce lo stato della partita specificata tramite `gameId`. Richiede autenticazione.
 * @access Privato
 *
 * @route GET /completed-games
 * @description Restituisce l'elenco delle partite concluse dell'utente autenticato. Richiede autenticazione.
 * @access Privato
 *
 * @route GET /leaderboard
 * @description Visualizza la classifica dei giocatori in base al punteggio. Accesso pubblico.
 * @access Pubblico
 *
 * @route GET /win-certificate/:gameId
 * @description Fornisce un certificato di vittoria per una partita specificata tramite `gameId`. Richiede autenticazione.
 * @access Privato
 *
 * @returns {JSON} - Dati specifici della partita richiesta o della classifica dei giocatori, oppure un certificato di vittoria.
 */

import express from 'express';
import gameController from '../controllers/gameController';
import { authenticationWithJWT } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create/new-game', authenticationWithJWT, gameController.createGame);
router.post('/abandon-game/:gameId', authenticationWithJWT, gameController.abandonGame);
router.get('/game-status/:gameId', authenticationWithJWT, gameController.evaluateGameStatus);
router.get('/completed-games', authenticationWithJWT, gameController.getCompletedGames);
router.get('/leaderboard', gameController.getPlayerLeaderboard);
router.get('/win-certificate/:gameId', authenticationWithJWT, gameController.getVictoryCertificate)

export default router;
