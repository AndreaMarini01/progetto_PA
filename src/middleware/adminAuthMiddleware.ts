import {NextFunction, Request, Response} from 'express';
import Player, {PlayerRole} from '../models/Player';
import TokenFactory, {tokenErrorType} from "../factories/tokenFactory";
import AuthFactory, {authErrorType} from "../factories/authFactory";

/**
 * Middleware per l'autenticazione degli amministratori.
 *
 * Questo middleware verifica se l'utente autenticato ha il ruolo di amministratore.
 * Se l'utente non è autenticato o non è un amministratore, viene generato un errore
 * appropriato. Altrimenti, il middleware consente il passaggio al middleware successivo.
 *
 * @param req - L'oggetto della richiesta Express contenente l'utente autenticato.
 * @param res - L'oggetto della risposta Express.
 * @param next - La funzione `NextFunction` per passare il controllo al middleware successivo in caso di successo.
 *
 * @throws {AuthError} - Lancia un errore se l'utente non è autenticato o non viene trovato.
 * @throws {TokenError} - Lancia un errore se l'utente autenticato non ha i permessi di amministratore.
 */

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw AuthFactory.createError(authErrorType.INVALID_CREDENTIALS);
        }
        // Trova il giocatore nel database utilizzando l'ID presente nel token JWT
        const player = await Player.findOne({ where: { player_id: req.user.player_id } });
        if (!player) {
            throw AuthFactory.createError(authErrorType.INVALID_CREDENTIALS);
        }
        if (player.role === PlayerRole.ADMIN) {
            next();
        } else {
            throw TokenFactory.createError(tokenErrorType.ADMIN_AUTHORIZATION);
        }
    } catch (err) {
        next(err);
    }
};
