import {NextFunction, Request, Response} from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import AuthFactory, {authErrorType} from "../factories/AuthFactory";

/**
 * Middleware `authenticationWithJWT` per autenticare gli utenti utilizzando un token JWT.
 *
 * Questo middleware verifica la presenza di un token JWT nell'intestazione di autorizzazione (`Authorization`),
 * controlla la validità del token, e aggiunge i dettagli dell'utente (`player_id`, `email`, `role`) a `req.user`
 * se il token è valido. Se il token è scaduto, non valido o mancante, genera un errore appropriato.
 *
 * @param req - L'oggetto `Request` di Express contenente l'intestazione di autorizzazione con il token JWT.
 * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client in caso di errore.
 * @param next - La funzione `NextFunction` di Express per passare il controllo al middleware successivo.
 *
 * @throws {AuthError} - Se il token JWT è mancante (errore `NEED_AUTHORIZATION`).
 * @throws {AuthError} - Se il token JWT è scaduto (errore `TOKEN_EXPIRED`).
 * @throws {AuthError} - Se il token JWT non è valido (errore `NOT_VALID_TOKEN`).
 */

export const authenticationWithJWT = (req: Request, res: Response, next: NextFunction) => {
    // Recupera l'header di autorizzazione dalla richiesta
    const authHeader = req.headers.authorization;
    if (authHeader) {
        // Estrae il token dall'header
        const token = authHeader.split(' ')[1];
        // Verifica il token utilizzando il segreto definito in JWT_SECRET nel .env
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) {
                // Se il token è scaduto o non valido, lancia un errore di token scaduto
                throw AuthFactory.createError(authErrorType.TOKEN_EXPIRED);
            }
            // Verifica che il token decodificato (`decoded`) sia di tipo `JwtPayload`
            if (typeof decoded === 'object' && decoded !== null) {
                // Associa i dati del payload JWT all'oggetto `req.user`, ovvero l'utente che fa la richiesta
                req.user = decoded as JwtPayload & {
                    player_id: number;
                    email: string;
                    role: string;
                };
                next();
            } else {
                throw AuthFactory.createError(authErrorType.NOT_VALID_TOKEN);
            }
        });
    } else {
        // Se l'header di autorizzazione è assente, lancia un errore di autorizzazione necessaria
        throw AuthFactory.createError(authErrorType.NEED_AUTHORIZATION);
    }
};



