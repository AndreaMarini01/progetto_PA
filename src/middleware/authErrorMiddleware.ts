// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../factories/authFactory'; // Importa la classe di errore personalizzato

function authErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AuthError) {
        // Gestisci gli errori di autenticazione
        res.status(err.statusCode).json({ message: err.message });
    } else {
        // Gestione generica per altri tipi di errori
        res.status(500).json({ message: 'Server Error' });
    }
}

export default authErrorHandler;
