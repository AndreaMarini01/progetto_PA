import { Request, Response } from 'express';
import MoveService from '../services/moveService';

class MoveController {
    public static async executeMove(req: Request, res: Response) {
        const { gameId, from, to } = req.body;

        // Ottieni il playerId dall'utente autenticato
        const playerId = req.user?.id_player;

        if (!playerId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!gameId || !from || !to) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        try {
            // Passa i parametri al servizio per eseguire la mossa
            const result = await MoveService.executeMove(gameId, from, to, playerId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: "errore ciaociao" });
        }
    }
}

export default MoveController;

