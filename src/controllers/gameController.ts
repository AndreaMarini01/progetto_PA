import { Request, Response, NextFunction } from 'express';
import { createGame } from '../services/gameService';
import { GameType, AIDifficulty } from '../models/Game';

import GameFactory, {gameErrorType} from '../factories/gameFactory';

export const createGameController = async (req: Request, res: Response, next: NextFunction) => {
    const { opponent_email, ai_difficulty } = req.body;
    const playerId = req.user?.id_player;

    try {
        if (!playerId) {
            throw GameFactory.createError(gameErrorType.MISSING_PLAYER_ID);
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

        const newGame = await createGame(playerId, opponent_email, type, ai_difficulty, initialBoard);

        res.status(201).json({ game: newGame });
    } catch (error) {
        next(error);
    }

};
