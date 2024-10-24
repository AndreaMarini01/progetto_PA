/*
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AuthFactory, { authErrorType } from '../factories/authFactory';

interface TokenPayload extends JwtPayload {
    id_player: number;
    email: string;
    role: string;
}
export const authenticationWithJWT = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(AuthFactory.createError(authErrorType.INVALID_CREDENTIALS))
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        // Verifica che il payload decodificato abbia la struttura corretta
        if (decoded && typeof decoded !== 'string' && 'id_player' in decoded && 'email' in decoded && 'role' in decoded) {
            req.user = decoded as TokenPayload; // Aggiunge i dati decodificati dal token JWT a req.user
            console.log('Utente autenticato:', req.user); // Debug
            next();
        } else {
            return next(AuthFactory.createError(authErrorType.INVALID_CREDENTIALS));
        }
    } catch (error) {
        next(AuthFactory.createError(authErrorType.INVALID_CREDENTIALS));
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (user && user.role === 'admin') {
        return next(); // L'utente ha il ruolo di admin, passa al middleware successivo
    }

    next(AuthFactory.createError(authErrorType.INVALID_CREDENTIALS));
};
*/

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticationWithJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Token non valido o scaduto.' });
            }

            // Verifica che decoded sia di tipo JwtPayload
            if (typeof decoded === 'object' && decoded !== null) {
                req.user = decoded as JwtPayload & {
                    id_player: number;
                    email: string;
                    role: string;
                };
                next();
            } else {
                res.status(403).json({ message: 'Token non valido.' });
            }
        });
    } else {
        res.status(401).json({ message: 'Autenticazione richiesta. Fornisci il token.' });
    }

    console.log('Utente autenticato:', req.user);
};



