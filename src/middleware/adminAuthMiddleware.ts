import { Request, Response, NextFunction } from 'express';
import Player, { PlayerRole } from '../models/Player';

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Autenticazione richiesta.' });
        }

        // Trova il giocatore nel database utilizzando l'ID presente nel token JWT
        const player = await Player.findOne({ where: { id_player: req.user.id_player } });

        if (!player) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        if (player.role === PlayerRole.ADMIN) {
            next();
        } else {
            res.status(403).json({ message: 'Accesso non consentito: solo gli admin possono effettuare questa operazione.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Errore del server durante la verifica dei permessi.' });
    }
};
