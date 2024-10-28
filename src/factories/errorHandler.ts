import {NextFunction, Request, Response} from 'express';
import {GameError, gameErrorType} from './gameFactory';
import {AuthError, authErrorType} from './authFactory';
import {TokenError, tokenErrorType} from "./tokenFactory";
import {MoveError, moveErrorType} from "./moveFactory";

/**
 * Middleware per la gestione centralizzata degli errori.
 *
 * Questo middleware controlla il tipo di errore ricevuto e restituisce una risposta HTTP
 * con lo status code appropriato e un messaggio di errore. Supporta diversi tipi di errori
 * specifici per il dominio dell'applicazione, come errori di gioco, autenticazione, token e mosse.
 *
 * @param err - L'errore generato durante l'esecuzione di una richiesta.
 * @param req - L'oggetto della richiesta Express.
 * @param res - L'oggetto della risposta Express.
 * @param next - La funzione `NextFunction` per passare il controllo al middleware successivo.
 */

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof GameError) {
        // Gestione degli errori di gioco
        let statusCode: number;
        switch (err.type) {
            case gameErrorType.MISSING_PLAYER_ID:
                statusCode = 400; // Bad Request
                break;
            case gameErrorType.INVALID_DIFFICULTY:
                statusCode = 400; // Bad Request
                break;
            case gameErrorType.INVALID_GAME_PARAMETERS:
                statusCode = 422; // Unprocessable entity
                break;
            case gameErrorType.MISSING_GAME_PARAMETERS:
                statusCode = 400; // Bad Request
                break;
            case gameErrorType.OPPONENT_NOT_FOUND:
                statusCode = 404; // Not Found
                break;
            case gameErrorType.PLAYER_ALREADY_IN_GAME:
                statusCode = 409; // Conflict
                break;
            case gameErrorType.OPPONENT_ALREADY_IN_GAME:
                statusCode = 409; // Conflict
                break;
            case gameErrorType.SELF_CHALLENGE_NOT_ALLOWED:
                statusCode = 400; // Bad Request
                break;
            case gameErrorType.GAME_NOT_IN_PROGRESS:
                statusCode = 409; // Conflict
                break;
            case gameErrorType.INVALID_DATE:
                statusCode = 400;
                break;
            case gameErrorType.MISSING_DATE:
                statusCode = 400;
                break;
            case gameErrorType.INVALID_DATE_RANGE:
                statusCode = 400;
                break;
            case gameErrorType.INSUFFICIENT_CREDIT:
                statusCode = 401;
                break;
            default:
                statusCode = 500; // Internal Server Error
                break;
        }
        res.status(statusCode).json({ error: err.message});
    } else if (err instanceof AuthError) {
        // Gestione degli errori di autenticazione
        let statusCode: number;
        switch (err.type) {
            case authErrorType.INVALID_CREDENTIALS:
                statusCode = 401 // Unauthorized
                break;
            case authErrorType.TOKEN_EXPIRED:
                statusCode = 401; // Unauthorized
                break;
            case authErrorType.UNAUTHORIZED:
                statusCode = 403; // Forbidden
                break;
            case authErrorType.NOT_VALID_TOKEN:
                statusCode = 401; // Unauthorized
                break;
            case authErrorType.NEED_AUTHORIZATION:
                statusCode = 401; // Unauthorized
                break;
            default:
                statusCode = 500; // Internal Server Error
                break;
        }
        res.status(statusCode).json({ error: err.message});
    } else if (err instanceof TokenError) {
        let statusCode: number;
        switch (err.type) {
            case tokenErrorType.ADMIN_AUTHORIZATION:
                statusCode = 403; //Forbidden
                break;
            case tokenErrorType.MISSING_PARAMETERS:
                statusCode = 400; // Bad Request
                break;
            case tokenErrorType.USER_NOT_FOUND:
                statusCode = 404; // Not Found
                break;
            case tokenErrorType.POSITIVE_TOKEN:
                statusCode = 422; // Unprocessable Entity
                break;
            default:
                statusCode = 500; // Internal Server Error
                break;
        }
        res.status(statusCode).json({error: err.message});
    } else if (err instanceof MoveError) {
        let statusCode: number;
        switch (err.type) {
            case moveErrorType.GAME_NOT_FOUND:
                statusCode = 404; // Not Found
                break;
            case moveErrorType.FAILED_PARSING:
                statusCode = 400; // Bad Request
                break;
            case moveErrorType.NOT_VALID_ARRAY:
                statusCode = 422; // Unprocessable Entity
                break;
            case moveErrorType.NOT_VALID_MOVE:
                statusCode = 422; // Unprocessable Entity
                break;
            case moveErrorType.MISSING_PARAMS:
                statusCode = 400; // Bad Request
                break;
            default:
                statusCode = 500; // Internal Server Error
                break;
        }
        res.status(statusCode).json({error: err.message});
    } else {
        // Gestione di errori generici non riconosciuti
        res.status(500).json({ error: 'Unknown error occurred.' });
    }
}

export default errorHandler;
