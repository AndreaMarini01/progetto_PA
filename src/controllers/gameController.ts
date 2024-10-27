import { Request, Response, NextFunction } from 'express';
import gameService from '../services/gameService';
import { GameType, AIDifficulty } from '../models/Game';
import GameFactory, { gameErrorType } from '../factories/gameFactory';
import Player from "../models/Player";

/**
 * Classe `GameController` per gestire le operazioni legate alle partite.
 *
 * Contiene metodi per la creazione di nuove partite e l'abbandono di partite esistenti.
 */
class gameController {
    /**
     * Gestisce la creazione di una nuova partita, sia PvP (Player vs. Player) che PvE (Player vs. Environment).
     *
     * @param req - L'oggetto della richiesta Express contenente i dati del corpo, inclusi `opponent_email` e `ai_difficulty`.
     * @param res - L'oggetto della risposta Express utilizzato per inviare la risposta al client, contenente i dettagli della nuova partita.
     * @param next - La funzione di callback `NextFunction` per passare il controllo al middleware successivo in caso di errore.
     *
     * @throws {GameFactory.createError} - Lancia errori in caso di parametri mancanti, giocatore già in gioco,
     *                                     difficoltà dell'IA non valida, o altri parametri non coerenti.
     *
     * @returns Una risposta JSON con i dettagli della partita appena creata se l'operazione è completata con successo.
     */
    public async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { opponent_email, ai_difficulty } = req.body;
        const playerId = req.user?.id_player;
        try {
            if (!playerId) {
                throw GameFactory.createError(gameErrorType.MISSING_PLAYER_ID);
            }
            let opponentId: number | null = null;
            if (opponent_email) {
                const opponent = await Player.findOne({ where: { email: opponent_email } });
                if (!opponent) {
                    throw GameFactory.createError(gameErrorType.OPPONENT_NOT_FOUND);
                }
                opponentId = opponent.id_player;
            }
            const existingGame = await gameService.findActiveGameForPlayer(playerId, opponentId);
            if (existingGame) {
                if (existingGame.player_id === playerId || existingGame.opponent_id === playerId) {
                    throw GameFactory.createError(gameErrorType.PLAYER_ALREADY_IN_GAME);
                }
                if (opponentId !== null && (existingGame.player_id === opponentId || existingGame.opponent_id === opponentId)) {
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
                if (!Object.values(AIDifficulty).includes(ai_difficulty)) {
                    throw GameFactory.createError(gameErrorType.INVALID_DIFFICULTY);
                }
            } else {
                throw GameFactory.createError(gameErrorType.MISSING_GAME_PARAMETERS);
            }
            const total_moves = 0;
            const initialBoard = {
                board: [
                    [null, "B", null, "B", null, "B", null, "B"],
                    ["B", null, "B", null, "B", null, "B", null],
                    [null, "B", null, "B", null, "B", null, "B"],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    ["W", null, "W", null, "W", null, "W", null],
                    [null, "W", null, "W", null, "W", null, "W"],
                    ["W", null, "W", null, "W", null, "W", null]
                ]
            };
            const newGame = await gameService.createGame(playerId, opponent_email, type, ai_difficulty, initialBoard, total_moves);
            res.status(201).json({ game: newGame });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gestisce l'abbandono di una partita esistente.
     *
     * @param req - L'oggetto della richiesta Express contenente l'ID della partita da abbandonare.
     * @param res - L'oggetto della risposta Express utilizzato per confermare l'abbandono della partita.
     * @param next - La funzione di callback `NextFunction` per passare il controllo al middleware successivo in caso di errore.
     *
     * @throws {MoveError} - Lancia errori se la partita non esiste o il giocatore non è autorizzato ad abbandonarla.
     *
     * @returns Una risposta JSON che conferma l'abbandono della partita.
     */
    public async abandonGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        const gameId = parseInt(req.params.gameId, 10);
        const playerId = req.user?.id_player;
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
}

export default new gameController();
