import { Request, Response, NextFunction } from 'express';
import gameService from '../services/gameService';
import Game, {GameType, AIDifficulty, GameStatus} from '../models/Game';
import GameFactory, { gameErrorType } from '../factories/gameFactory';
import Player from "../models/Player";
import * as fs from "node:fs";
import * as path from "node:path";
import {readFileSync} from "fs";

/**
 * Classe `GameController` per gestire le operazioni legate alle partite.
 *
 * Contiene metodi per la creazione di nuove partite e l'abbandono di partite esistenti.
 */

class gameController {

    /**
     * Crea una nuova partita tra due giocatori (PvP) o contro l'IA (PvE) con le impostazioni specificate.
     *
     * @param req - L'oggetto `Request` di Express contenente i parametri di creazione della partita nel corpo della richiesta.
     *   - `opponent_email` (string | opzionale) - L'email dell'avversario per una partita PvP. Necessario se il tipo di partita è PvP.
     *   - `ai_difficulty` (AIDifficulty | opzionale) - La difficoltà dell'IA per una partita PvE. Necessario se il tipo di partita è PvE.
     * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
     *   - Risponde con i dettagli della partita appena creata in caso di successo.
     * @param next - La funzione `NextFunction` di Express utilizzata per gestire eventuali errori.
     *
     * @returns `Promise<void>` - Non restituisce un valore diretto, ma invia una risposta JSON contenente i dettagli della partita o passa l'errore al middleware di gestione degli errori.
     *
     * @throws {GameError} - Genera un errore se:
     *   - `playerId` non è presente (es. l'utente non è autenticato).
     *   - L'avversario specificato con `opponent_email` non esiste.
     *   - Il giocatore o l'avversario sono già in una partita attiva.
     *   - Il giocatore tenta di sfidare sé stesso.
     *   - Vengono forniti sia `opponent_email` che `ai_difficulty`.
     *   - Viene fornito un valore di `ai_difficulty` non valido o assente in una partita PvE.
     *   - I parametri di creazione della partita sono insufficienti.
     *
     * Esempio di corpo della richiesta per una partita PvP:
     * ```json
     * {
     *   "opponent_email": "avversario@example.com"
     * }
     * ```
     *
     * Esempio di corpo della richiesta per una partita PvE:
     * ```json
     * {
     *   "ai_difficulty": "Easy"
     * }
     * ```
     *
     * Esempio di risposta in caso di successo:
     * ```json
     * {
     *   "game": {
     *     "game_id": 1,
     *     "player_id": 123,
     *     "opponent_id": 456,
     *     "status": "ONGOING",
     *     "type": "PVP",
     *     "ai_difficulty": 'Absent',
     *     "board": {
     *       "board": [
     *         [null, "B", null, "B", null, "B", null, "B"],
     *         ["B", null, "B", null, "B", null, "B", null],
     *         [null, "B", null, "B", null, "B", null, "B"],
     *         [null, null, null, null, null, null, null, null],
     *         [null, null, null, null, null, null, null, null],
     *         ["W", null, "W", null, "W", null, "W", null],
     *         [null, "W", null, "W", null, "W", null, "W"],
     *         ["W", null, "W", null, "W", null, "W", null]
     *       ]
     *     },
     *     "total_moves": 0
     *   }
     * }
     * ```
     */

    public async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        // Converte `opponent_email` e `ai_difficulty` in minuscolo, se presenti
        if (req.body.opponent_email && typeof req.body.opponent_email === 'string') {
            req.body.opponent_email = req.body.opponent_email.toLowerCase();
        }
        if (req.body.ai_difficulty && typeof req.body.ai_difficulty === 'string') {
            req.body.ai_difficulty = req.body.ai_difficulty.toLowerCase();
        }
        const {opponent_email, ai_difficulty} = req.body;
        const playerId = req.user?.player_id;
        try {
            if (!playerId) {
                throw GameFactory.createError(gameErrorType.MISSING_PLAYER_ID);
            }
            //let opponentId: number | null = null;
            let opponentId: number | null = -1
            if (opponent_email) {
                const opponent = await Player.findOne({where: {email: opponent_email}});
                if (!opponent) {
                    throw GameFactory.createError(gameErrorType.OPPONENT_NOT_FOUND);
                }
                opponentId = opponent.player_id;
            }
            const existingGame = await gameService.findActiveGameForPlayer(playerId, opponentId);
            if (existingGame && existingGame.status === GameStatus.ONGOING) {
                if (existingGame.player_id === playerId || existingGame.opponent_id === playerId) {
                    throw GameFactory.createError(gameErrorType.PLAYER_ALREADY_IN_GAME);
                }
                //if (opponentId !== null && (existingGame.player_id === opponentId || existingGame.opponent_id === opponentId)) {
                if (opponentId !== -1 && (existingGame.player_id === opponentId || existingGame.opponent_id === opponentId)) {
                    throw GameFactory.createError(gameErrorType.OPPONENT_ALREADY_IN_GAME);
                }
            }
            if (req.user?.email === opponent_email) {
                throw GameFactory.createError(gameErrorType.SELF_CHALLENGE_NOT_ALLOWED);
            }
            if (opponent_email && ai_difficulty) {
                throw GameFactory.createError(gameErrorType.INVALID_GAME_PARAMETERS);
            }
            let type: GameType;
            if (opponent_email) {
                type = GameType.PVP;
            } else if (ai_difficulty) {
                type = GameType.PVE;
                if (ai_difficulty === AIDifficulty.ABSENT) {
                    throw GameFactory.createError(gameErrorType.INVALID_DIFFICULTY);
                }
                if (!Object.values(AIDifficulty).includes(ai_difficulty)) {
                    throw GameFactory.createError(gameErrorType.INVALID_DIFFICULTY);
                }
            } else {
                throw GameFactory.createError(gameErrorType.MISSING_GAME_PARAMETERS);
            }
            const total_moves = 0;

            // Lettura della configurazione della board dal file JSON
            const initialBoardPath = 'src/initialBoard.json';
            const initialBoard = JSON.parse(readFileSync(initialBoardPath, 'utf8'));

            const newGame = await gameService.createGame(playerId, opponent_email, type, ai_difficulty, initialBoard, total_moves);
            res.status(201).json({game: newGame});
        } catch (error) {
            next(error);
        }
    }

    /**
     * Permette a un giocatore di abbandonare una partita specifica, aggiornando lo stato della partita.
     *
     * @param req - L'oggetto `Request` di Express contenente:
     *   - `gameId` (string) - L'ID della partita da abbandonare, passato come parametro URL.
     *   - `req.user.player_id` (number) - L'ID del giocatore che sta abbandonando la partita, estratto dall'utente autenticato.
     * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
     *   - Risponde con un messaggio di conferma e i dettagli della partita aggiornata in caso di successo.
     * @param next - La funzione `NextFunction` di Express utilizzata per gestire eventuali errori.
     *
     * @returns `Promise<void>` - Non restituisce un valore diretto, ma invia una risposta JSON contenente i dettagli della partita abbandonata o passa l'errore al middleware di gestione degli errori.
     *
     * @throws {GameError} - Genera un errore se:
     *   - `gameId` non è valido o non corrisponde a nessuna partita.
     *   - `playerId` non è presente (ad esempio, se l'utente non è autenticato).
     *   - Il giocatore non ha il permesso di abbandonare la partita o si verifica un altro errore durante l'abbandono.
     *
     * Esempio di URL per la richiesta:
     * ```
     * POST /abandon-game/4
     * ```
     *
     * Esempio di risposta in caso di successo:
     * ```json
     * {
     *   "message": "Game with ID 4 has been abandoned.",
     *   "game_id": 4,
     *   "status": "ABANDONED"
     * }
     * ```
     */

    public async abandonGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        const gameId = parseInt(req.params.gameId, 10);
        const playerId = req.user?.player_id;
        try {
            const game = await gameService.abandonGame(gameId, playerId!);
            res.status(200).json({
                message: `Game with ID ${gameId} has been abandoned.`,
                game_id: gameId,
                status: game.status,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Restituisce lo stato attuale di una partita specifica, inclusa la configurazione della board.
     *
     * @param req - L'oggetto `Request` di Express contenente:
     *   - `gameId` (string) - L'ID della partita di cui si vuole ottenere lo stato, passato come parametro URL.
     * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
     *   - Risponde con lo stato della partita e la configurazione della board in caso di successo.
     * @param next - La funzione `NextFunction` di Express utilizzata per gestire eventuali errori.
     *
     * @returns `Promise<void>` - Non restituisce un valore diretto, ma invia una risposta JSON contenente lo stato attuale della partita e la configurazione della board o passa l'errore al middleware di gestione degli errori.
     *
     * @throws {GameError} - Genera un errore se:
     *   - `gameId` non è valido o non corrisponde a nessuna partita (GAME_NOT_FOUND).
     *
     * Esempio di URL per la richiesta:
     * ```
     * GET /game-status/2
     * ```
     *
     * Esempio di risposta in caso di successo:
     * ```json
     * {
     *   "message": "The current status of the game is: ONGOING",
     *   "game_id": 2,
     *   "board": [
     *     [null, "B", null, "B", null, "B", null, "B"],
     *     ["B", null, "B", null, "B", null, "B", null],
     *     [null, "B", null, "B", null, "B", null, "B"],
     *     [null, null, null, null, null, null, null, null],
     *     [null, null, null, null, null, null, null, null],
     *     ["W", null, "W", null, "W", null, "W", null],
     *     [null, "W", null, "W", null, "W", null, "W"],
     *     ["W", null, "W", null, "W", null, "W", null]
     *   ]
     * }
     * ```
     */

    public async evaluateGameStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        const gameId = parseInt(req.params.gameId, 10);
        try {
            const game = await Game.findByPk(gameId);
            if (!game) {
                throw GameFactory.createError(gameErrorType.GAME_NOT_FOUND);
            }
            // Restituisce lo stato della partita e la configurazione della board
            res.status(200).json({
                message: `The current status of the game is: ${game.status}`,
                game_id: gameId,
                board: game.board
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Recupera le partite completate di un giocatore in un intervallo di date specificato.
     *
     * @param req - L'oggetto `Request` di Express contenente:
     *   - `req.user.player_id` (number) - L'ID del giocatore che richiede le partite concluse, estratto dall'utente autenticato.
     *   - `startDate` (string | opzionale) - Data di inizio dell'intervallo di ricerca delle partite (in formato stringa).
     *   - `endDate` (string | opzionale) - Data di fine dell'intervallo di ricerca delle partite (in formato stringa).
     * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
     *   - Risponde con un elenco di partite concluse per il giocatore specificato, senza il campo `board` in ogni partita.
     * @param next - La funzione `NextFunction` di Express utilizzata per gestire eventuali errori.
     *
     * @returns `Promise<void>` - Non restituisce un valore diretto, ma invia una risposta JSON contenente i dettagli delle partite concluse o passa l'errore al middleware di gestione degli errori.
     *
     * @throws {GameError} - Genera un errore se:
     *   - `playerId` non è presente (ad esempio, se l'utente non è autenticato).
     *
     * Esempio di URL per la richiesta:
     * ```
     * GET /completed-games?startDate=2024-10-26&endDate=2024-10-30
     * ```
     *
     * Esempio di risposta in caso di successo:
     * ```json
     * {
     *   "data": {
     *     "games": [
     *       {
     *         "game_id": 1,
     *         "player_id": 123,
     *         "opponent_id": 456,
     *         "status": "Completed",
     *         "type": "PVP",
     *         "total_moves": 42,
     *         "winner_id": 123,
     *         "created_at": "2024-10-30T10:32:06.334Z",
     *         "ended_at": "2024-10-30T10:32:23.428Z"
     *       },
     *     ]
     *   }
     * }
     * ```
     */

    public async getCompletedGames(req: Request, res: Response, next: NextFunction): Promise<void> {
        const playerId = req.user?.player_id;
        const {startDate, endDate} = req.query;
        try {
            if (!playerId) {
                throw GameFactory.createError(gameErrorType.MISSING_PLAYER_ID);
            }
            // Chiama il metodo del servizio per ottenere le partite concluse
            const result = await gameService.getCompletedGames(playerId, startDate as string, endDate as string);
            // Rimuove dalla risposta il campo board
            result.games.forEach(game => delete game.board);
            // Invia la risposta con i dati delle partite concluse
            res.status(200).json({
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Recupera la classifica dei giocatori ordinata per punteggio in ordine crescente o decrescente.
     *
     * @param req - L'oggetto `Request` di Express contenente:
     *   - `order` (string | opzionale) - Il parametro di ordinamento nella query, che può essere "asc" o "desc". Predefinito a "desc".
     * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
     *   - Risponde con la classifica dei giocatori ordinata per punteggio.
     * @param next - La funzione `NextFunction` di Express utilizzata per gestire eventuali errori.
     *
     * @returns `Promise<void>` - Non restituisce un valore diretto, ma invia una risposta JSON contenente la classifica dei giocatori o passa l'errore al middleware di gestione degli errori.
     *
     * @throws {Error} - Genera un errore se:
     *   - Si verifica un problema durante il recupero della classifica.
     *
     * Esempio di URL per la richiesta:
     * ```
     * GET /leaderboard?order=asc
     * ```
     *
     * Esempio di risposta in caso di successo:
     * ```json
     * {
     *   "message": "Classifica giocatori recuperata con successo.",
     *   "data": [
     *     {
     *       "player_id": 1,
     *       "username": "Giocatore1",
     *       "score": 1500
     *     },
     *     {
     *       "player_id": 2,
     *       "username": "Giocatore2",
     *       "score": 1450
     *     },
     *     ...
     *   ]
     * }
     * ```
     */

    public async getPlayerLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Recupera il parametro di ordinamento dalla query, predefinito "desc"
            const order = req.query.order === 'asc' ? 'asc' : 'desc';
            // Chiama il servizio per ottenere la classifica dei giocatori
            const leaderboard = await gameService.getPlayerLeaderboard(order);
            // Invia la risposta con la classifica dei giocatori
            res.status(200).json({
                message: 'Classifica giocatori recuperata con successo.',
                data: leaderboard
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Genera e restituisce un certificato di vittoria in formato PDF per una partita specifica.
     *
     * @param req - L'oggetto `Request` di Express contenente:
     *   - `gameId` (string) - L'ID della partita per la quale si desidera generare il certificato, passato come parametro URL.
     *   - `req.user.player_id` (number) - L'ID del giocatore che richiede il certificato, estratto dall'utente autenticato.
     * @param res - L'oggetto `Response` di Express utilizzato per inviare il certificato PDF al client.
     *   - Configura la risposta per il download del PDF, impostando i corretti header HTTP.
     * @param next - La funzione `NextFunction` di Express utilizzata per gestire eventuali errori.
     *
     * @returns `Promise<void>` - Non restituisce un valore diretto, ma invia una risposta con il PDF del certificato o passa l'errore al middleware di gestione degli errori.
     *
     * @throws {GameError} - Genera un errore se:
     *   - `gameId` non è valido o non corrisponde a nessuna partita.
     *   - `playerId` non è presente (ad esempio, se l'utente non è autenticato).
     *   - Il certificato non può essere generato per altre ragioni (es. partita non completata).
     *
     * Esempio di URL per la richiesta:
     * ```
     * GET /win-certificate/1
     * ```
     *
     * Esempio di risposta in caso di successo:
     * - La risposta sarà un file PDF scaricabile con il certificato di vittoria.
     */

    public async getVictoryCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
        const gameId = parseInt(req.params.gameId, 10);
        const playerId = req.user?.player_id;

        try {
            // Richiama il servizio per generare il certificato
            const pdfData = await gameService.generateVictoryCertificate(gameId, playerId!);
            // Configura la risposta per il download del PDF
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="certificato_vittoria_partita_${gameId}.pdf"`,
                'Content-Length': pdfData.length,
            }).end(pdfData);
        } catch (error) {
            next(error);
        }
    }
}

export default new gameController();
