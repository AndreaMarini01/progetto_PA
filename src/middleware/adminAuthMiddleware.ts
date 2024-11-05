import {NextFunction, Request, Response} from 'express';
import Player, {PlayerRole} from '../models/Player';
import TokenFactory, {tokenErrorType} from "../factories/TokenFactory";
import AuthFactory, {authErrorType} from "../factories/AuthFactory";

/**
 * Middleware `adminAuthMiddleware` per verificare i permessi di amministratore dell'utente autenticato.
 *
 * Questo middleware controlla se l'utente autenticato ha un ruolo di amministratore (`PlayerRole.ADMIN`).
 * Se l'utente non è autenticato, non esiste nel database o non è un amministratore, genera un errore appropriato.
 *
 * @param {Request} req - L'oggetto `Request` di Express contenente i dettagli della richiesta e i dati utente.
 * @param {Response} res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
 * @param {NextFunction} next - La funzione `NextFunction` di Express utilizzata per passare il controllo al middleware successivo.
 *
 * @throws {AuthError} - Se `req.user` non è presente o l'utente non esiste nel database (errore `INVALID_CREDENTIALS`).
 * @throws {TokenError} - Se l'utente non ha ruolo di amministratore (errore `ADMIN_AUTHORIZATION`).
 */

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Verifica se l'utente è autenticato
        if (!req.user) {
            throw AuthFactory.createError(authErrorType.INVALID_CREDENTIALS);
        }
        // Trova il giocatore nel database utilizzando l'ID dell'utente autenticato
        const player = await Player.findOne({ where: { player_id: req.user.player_id } });
        if (!player) {
            throw AuthFactory.createError(authErrorType.INVALID_CREDENTIALS);
        }
        // Verifica se il ruolo del giocatore è 'ADMIN'
        if (player.role === PlayerRole.ADMIN) {
            // Se il giocatore è un amministratore, passa il controllo al prossimo middleware
            next();
        } else {
            // Se il giocatore non è un amministratore, lancia un errore di autorizzazione specifico per admin
            throw TokenFactory.createError(tokenErrorType.ADMIN_AUTHORIZATION);
        }
    } catch (err) {
        // In caso di errore, passa l'errore al middleware di gestione degli errori
        next(err);
    }
};
