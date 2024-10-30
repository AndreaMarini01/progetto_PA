import {NextFunction, Request, Response} from 'express';
import Player, {PlayerRole} from '../models/Player';
import TokenFactory, {tokenErrorType} from "../factories/tokenFactory";
import AuthFactory, {authErrorType} from "../factories/authFactory";

/**
 * Middleware `adminAuthMiddleware` per verificare i permessi di amministratore dell'utente autenticato.
 *
 * Questo middleware controlla se l'utente autenticato ha un ruolo di amministratore (`PlayerRole.ADMIN`).
 * Se l'utente non è autenticato, non esiste nel database o non è un amministratore, genera un errore appropriato.
 *
 * @param req - L'oggetto `Request` di Express contenente i dettagli della richiesta e i dati utente.
 * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
 * @param next - La funzione `NextFunction` di Express utilizzata per passare il controllo al middleware successivo.
 *
 * @throws {AuthError} - Se `req.user` non è presente o l'utente non esiste nel database (errore `INVALID_CREDENTIALS`).
 * @throws {TokenError} - Se l'utente non ha ruolo di amministratore (errore `ADMIN_AUTHORIZATION`).
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
