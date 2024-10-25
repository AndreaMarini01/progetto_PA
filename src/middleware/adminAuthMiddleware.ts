import {NextFunction, Request, Response} from 'express';
import Player, {PlayerRole} from '../models/Player';
import TokenFactory, {tokenErrorType} from "../factories/tokenFactory";
import AuthFactory, {authErrorType} from "../factories/authFactory";

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            //return res.status(401).json({ message: 'Autenticazione richiesta.' });
            throw AuthFactory.createError(authErrorType.INVALID_CREDENTIALS);
        }

        // Trova il giocatore nel database utilizzando l'ID presente nel token JWT
        const player = await Player.findOne({ where: { id_player: req.user.id_player } });

        if (!player) {
            //return res.status(404).json({ message: 'Utente non trovato.' });
            throw AuthFactory.createError(authErrorType.INVALID_CREDENTIALS);
        }

        if (player.role === PlayerRole.ADMIN) {
            next();
        } else {
            //res.status(403).json({ message: 'Accesso non consentito: solo gli admin possono effettuare questa operazione.' });
            throw TokenFactory.createError(tokenErrorType.ADMIN_AUTHORIZATION);
        }
    } catch (err) {
        //res.status(500).json({ message: 'Errore del server durante la verifica dei permessi.' });
        next(err);
    }
};
