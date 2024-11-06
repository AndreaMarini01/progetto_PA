/**
 * Middleware `errorHandler` per la gestione centralizzata degli errori nell'applicazione.
 *
 * Questo gestore cattura diversi tipi di errori, inclusi errori di gioco (`GameError`),
 * autenticazione (`AuthError`), token (`TokenError`) e mosse (`MoveError`), restituendo
 * un codice di stato HTTP e un messaggio di errore appropriato. I codici di stato vengono
 * assegnati utilizzando `http-status-codes` per migliorare la leggibilità e la manutenzione.
 *
 * @param err - L'oggetto dell'errore, che può essere di tipo `GameError`, `AuthError`,
 * `TokenError`, `MoveError` o un errore generico.
 * @param req - L'oggetto `Request` di Express.
 * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
 * @param next - La funzione `NextFunction` di Express per passare il controllo al middleware successivo.
 *
 * @returns {void} - Restituisce una risposta JSON con il codice di stato e il messaggio di errore appropriato per ciascun tipo di errore.
 *
 * @errorCodes
 * - **StatusCodes.BAD_REQUEST (400)** - Richiesta errata: parametri mancanti o valori non validi.
 * - **StatusCodes.UNAUTHORIZED (401)** - Non autorizzato: credenziali o token mancanti o non validi.
 * - **StatusCodes.FORBIDDEN (403)** - Accesso negato: tentativo di accesso non consentito.
 * - **StatusCodes.NOT_FOUND (404)** - Risorsa non trovata: oggetto o entità specificata non trovata.
 * - **StatusCodes.CONFLICT (409)** - Conflitto: azione non consentita a causa di uno stato attuale (es. partita già in corso).
 * - **StatusCodes.UNPROCESSABLE_ENTITY (422)** - Entità non processabile: dati validi dal punto di vista sintattico ma con errori logici.
 * - **StatusCodes.INTERNAL_SERVER_ERROR (500)** - Errore interno del server: errore generico per errori non gestiti specificamente.
 */

import {NextFunction, Request, Response} from 'express';
import {GameError, gameErrorType} from './GameFactory';
import {AuthError, authErrorType} from './AuthFactory';
import {TokenError, tokenErrorType} from "./TokenFactory";
import {MoveError, moveErrorType} from "./MoveFactory";
import {StatusCodes} from 'http-status-codes';

function ErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof GameError) {
        let statusCode: number;
        switch (err.type) {
            case gameErrorType.MISSING_PLAYER_ID:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case gameErrorType.INVALID_DIFFICULTY:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case gameErrorType.INVALID_GAME_PARAMETERS:
                statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
                break;
            case gameErrorType.MISSING_GAME_PARAMETERS:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case gameErrorType.OPPONENT_NOT_FOUND:
                statusCode = StatusCodes.NOT_FOUND;
                break;
            case gameErrorType.PLAYER_ALREADY_IN_GAME:
                statusCode = StatusCodes.CONFLICT;
                break;
            case gameErrorType.OPPONENT_ALREADY_IN_GAME:
                statusCode = StatusCodes.CONFLICT;
                break;
            case gameErrorType.SELF_CHALLENGE_NOT_ALLOWED:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case gameErrorType.GAME_NOT_IN_PROGRESS:
                statusCode = StatusCodes.CONFLICT;
                break;
            case gameErrorType.INVALID_DATE:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case gameErrorType.MISSING_DATE:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case gameErrorType.INVALID_DATE_RANGE:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case gameErrorType.INSUFFICIENT_CREDIT:
                statusCode = StatusCodes.UNAUTHORIZED;
                break;
            case gameErrorType.GAME_NOT_FOUND:
                statusCode = StatusCodes.NOT_FOUND;
                break;
            case gameErrorType.ONLY_WINNER:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case gameErrorType.GAME_IN_PROGRESS:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            default:
                statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
                break;
        }
        // Restituisce la risposta ed il relativo messaggio di errore
        res.status(statusCode).json({ error: err.message});
    } else if (err instanceof AuthError) {
        let statusCode: number;
        switch (err.type) {
            case authErrorType.INVALID_CREDENTIALS:
                statusCode = StatusCodes.UNAUTHORIZED;
                break;
            case authErrorType.TOKEN_EXPIRED:
                statusCode = StatusCodes.UNAUTHORIZED;
                break;
            case authErrorType.UNAUTHORIZED:
                statusCode = StatusCodes.FORBIDDEN;
                break;
            case authErrorType.NOT_VALID_TOKEN:
                statusCode = StatusCodes.UNAUTHORIZED;
                break;
            case authErrorType.NEED_AUTHORIZATION:
                statusCode = StatusCodes.UNAUTHORIZED;
                break;
            default:
                statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
                break;
        }
        // Restituisce la risposta ed il relativo messaggio di errore
        res.status(statusCode).json({ error: err.message});
    } else if (err instanceof TokenError) {
        let statusCode: number;
        switch (err.type) {
            case tokenErrorType.ADMIN_AUTHORIZATION:
                statusCode = StatusCodes.FORBIDDEN;
                break;
            case tokenErrorType.MISSING_PARAMETERS:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case tokenErrorType.USER_NOT_FOUND:
                statusCode = StatusCodes.NOT_FOUND;
                break;
            case tokenErrorType.POSITIVE_TOKEN:
                statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
                break;
            default:
                statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
                break;
        }
        // Restituisce la risposta ed il relativo messaggio di errore
        res.status(statusCode).json({error: err.message});
    } else if (err instanceof MoveError) {
        let statusCode: number;
        switch (err.type) {
            case moveErrorType.GAME_NOT_FOUND:
                statusCode = StatusCodes.NOT_FOUND;
                break;
            case moveErrorType.FAILED_PARSING:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case moveErrorType.NOT_VALID_ARRAY:
                statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
                break;
            case moveErrorType.NOT_VALID_MOVE:
                statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
                break;
            case moveErrorType.MISSING_PARAMS:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case moveErrorType.NO_MOVES:
                statusCode = StatusCodes.NOT_FOUND;
                break;
            case moveErrorType.INVALID_FORMAT:
                statusCode = StatusCodes.NOT_FOUND;
                break;
            case moveErrorType.NOT_PLAYER_TURN:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            case moveErrorType.TIME_OUT:
                statusCode = StatusCodes.BAD_REQUEST;
                break;
            default:
                statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
                break;
        }
        // Restituisce la risposta ed il relativo messaggio di errore
        res.status(statusCode).json({error: err.message});
    } else {
        // Gestione di errori generici non riconosciuti
        res.status(500).json({ error: 'Unknown error occurred.' });
    }
}

export default ErrorHandler;
