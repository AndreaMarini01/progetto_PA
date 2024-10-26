import { Request, Response, NextFunction } from 'express';
import {createGame, findActiveGameForPlayer} from '../services/gameService';
import { GameType, AIDifficulty } from '../models/Game';

import GameFactory, {gameErrorType} from '../factories/gameFactory';
import Player from "../models/Player";

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
