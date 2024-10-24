// gameController.ts
import { Request, Response, NextFunction } from 'express';
import { createGame } from '../services/gameService';
import { GameType, AIDifficulty } from '../models/Game';

export const createGameController = async (req: Request, res: Response, next: NextFunction) => {
    const { opponent_email, ai_difficulty } = req.body;
    const playerId = req.user?.id_player;

    try {
        if (!playerId) {
            console.log('ID giocatore autenticato:', playerId);
            return res.status(400).json({ message: 'ID del giocatore mancante.' });
        }

        if (opponent_email && ai_difficulty) {
            return res.status(400).json({ message: "Puoi specificare o l'email dell'avversario o il livello di difficoltà dell'IA, ma non entrambi." });
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
                return res.status(400).json({ message: 'Livello di difficoltà non valido.' });
            }
        } else {
            // Se non sono forniti né opponent_email né aiDifficulty, restituisci un errore
            return res.status(400).json({ message: 'Devi specificare l\'email dell\'avversario o il livello di difficoltà dell\'IA.' });
        }

        // Usa il servizio per creare la partita
        const newGame = await createGame(playerId, opponent_email, type, ai_difficulty);

        res.status(201).json({ game: newGame });
    } catch (error) {
        next(error);
    }

};
