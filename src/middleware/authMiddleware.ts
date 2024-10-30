import {NextFunction, Request, Response} from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import AuthFactory, {authErrorType} from "../factories/authFactory";

/**
 * Middleware per l'autenticazione con JSON Web Token (JWT).
 *
 * Questo middleware verifica se l'utente è autenticato tramite un token JWT fornito
 * nell'intestazione della richiesta. Se il token è valido, i dati decodificati vengono
 * aggiunti all'oggetto `req.user`. Se il token è mancante, non valido o scaduto, viene
 * generato un errore appropriato.
 *
 * @param req - L'oggetto della richiesta Express contenente l'intestazione `Authorization` con il token JWT.
 * @param res - L'oggetto della risposta Express.
 * @param next - La funzione `NextFunction` per passare il controllo al middleware successivo in caso di autenticazione riuscita.
 *
 * @throws {AuthError} - Lancia un errore se il token è mancante, non valido o scaduto, oppure se i dati del token non sono corretti.
 */

export const authenticationWithJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) {
                throw AuthFactory.createError(authErrorType.TOKEN_EXPIRED);
            }
            // Verifica che decoded sia di tipo JwtPayload
            if (typeof decoded === 'object' && decoded !== null) {
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
        throw AuthFactory.createError(authErrorType.NEED_AUTHORIZATION);
    }
};



