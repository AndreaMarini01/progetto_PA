import { Request, Response, NextFunction } from 'express';
import {createGame, findActiveGameForPlayer} from '../services/gameService';
import { GameType, AIDifficulty } from '../models/Game';
import GameFactory, {gameErrorType} from '../factories/gameFactory';
import Player from "../models/Player";
import { abandonGame } from '../services/gameService';

/**
 * Gestisce la creazione di una nuova partita, sia PvP (Player vs. Player) che PvE (Player vs. Environment).
 *
 * Questa funzione verifica i parametri forniti per la creazione della partita, come l'email dell'avversario
 * o la difficoltà dell'IA. Se i parametri sono validi, crea una nuova partita e restituisce i dettagli al
 * client. La funzione verifica anche che il giocatore non sia già impegnato in un'altra partita e che i
 * parametri siano coerenti con il tipo di partita (PvP o PvE).
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

export const createGameController = async (req: Request, res: Response, next: NextFunction) => {
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
        // Vede se il giocatore è gia impegnato in un'altra partita
        const existingGame = await findActiveGameForPlayer(playerId, opponentId);
        if (existingGame) {
            let message = 'The player is already playing';
            if (existingGame.player_id === playerId || existingGame.opponent_id === playerId) {
                throw GameFactory.createError(gameErrorType.PLAYER_ALREADY_IN_GAME);
            }
            else if (opponentId !== null && (existingGame.player_id === opponentId || existingGame.opponent_id === opponentId)) {
                throw GameFactory.createError(gameErrorType.OPPONENT_ALREADY_IN_GAME);
            }
            return res.status(400).json({ message });
        }
        if (req.user?.email === opponent_email){
            throw GameFactory.createError(gameErrorType.SELF_CHALLENGE_NOT_ALLOWED);
        }
        if (opponent_email && ai_difficulty) {
            throw GameFactory.createError(gameErrorType.INVALID_GAME_PARAMETERS);
        }
        let type: GameType;
        if (opponent_email) {
            // Se è presente l'email dell'avversario, è una partita PvP
            type = GameType.PVP;
        } else if (ai_difficulty) {
            // Se è presente il livello di difficoltà dell'IA, è una partita PvE
            type = GameType.PVE;
            // Verifica che il livello di difficoltà sia valido
            if (!Object.values(AIDifficulty).includes(ai_difficulty)) {
                throw GameFactory.createError(gameErrorType.INVALID_DIFFICULTY);
            }
        } else {
            // Se non sono forniti né opponent_email né aiDifficulty, restituisci un errore
            throw GameFactory.createError(gameErrorType.MISSING_GAME_PARAMETERS);
        }
        const total_moves = 0
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
        const newGame = await createGame(playerId, opponent_email, type, ai_difficulty, initialBoard, total_moves);
        res.status(201).json({ game: newGame });
    } catch (error) {
        next(error);
    }
};

export const abandonGameController = async (req: Request, res: Response, next: NextFunction) => {
    const gameId = parseInt(req.params.gameId, 10);
    const playerId = req.user?.id_player;

    try {
        const game = await abandonGame(gameId, playerId!);
        res.status(200).json({
            message: `Game with ID ${gameId} has been abandoned.`,
            game_id: gameId,
            status: game.status,
        });
    } catch (error) {
        next(error);
    }
};
