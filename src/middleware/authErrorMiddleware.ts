// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
// import { AuthError } from '../factories/authFactory'; // Importa la classe di errore personalizzato
import AuthFactory, { authErrorType } from '../factories/authFactory';


function authErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    // Controlla se l'errore ha un tipo specifico definito nell'ENUM
    if (err.type && Object.values(authErrorType).includes(err.type)) {
        const errorMessage = AuthFactory.getErrorMessage(err.type as authErrorType);

        // Mappa i tipi di errore ai codici di stato HTTP
        let statusCode;
        switch (err.type) {
            case authErrorType.INVALID_CREDENTIALS:
                statusCode = 401;
                break
            case authErrorType.TOKEN_EXPIRED:
                statusCode = 401; // Forbidden
                break;
            case authErrorType.UNAUTHORIZED:
                statusCode = 403; // Forbidden
                break;
            default:
                statusCode = 500; // Internal Server Error
                break;
        }

        // Invia la risposta con il messaggio di errore e il codice di stato
        res.status(statusCode).json({ error: errorMessage });
    } else {
        // Se l'errore non è un errore di autenticazione riconosciuto, passa al middleware successivo
        next(err);
    }
}

export default authErrorHandler;
