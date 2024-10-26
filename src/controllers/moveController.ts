import {NextFunction, Request, Response} from 'express';
import MoveService from '../services/moveService';
import GameFactory from "../factories/gameFactory";
import AuthFactory, {authErrorType} from "../factories/authFactory";
import authFactory from "../factories/authFactory";
import MoveFactory, {moveErrorType} from "../factories/moveFactory";

class MoveController {
    public static async executeMove(req: Request, res: Response, next: NextFunction) {
        const { gameId, from, to } = req.body;

        // Ottieni il playerId dall'utente autenticato
        const playerId = req.user?.id_player;
        try {
        if (!playerId) {
            //return res.status(401).json({ message: 'User not authenticated' });
            throw AuthFactory.createError(authErrorType.NEED_AUTHORIZATION);
        }

        if (!gameId || !from || !to) {
            //return res.status(400).json({ message: 'Missing required parameters' });
            throw MoveFactory.createError(moveErrorType.MISSING_PARAMS);
        }


            // Passa i parametri al servizio per eseguire la mossa
            const result = await MoveService.executeMove(gameId, from, to, playerId);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: "andrea marinottoski" });
            next(err)
        }
    }
}

export default MoveController;

