/**
 * Middleware `errorHandler` per la gestione centralizzata degli errori nell'applicazione.
 *
 * Questo gestore cattura diversi tipi di errori, inclusi errori di gioco (`GameError`),
 * autenticazione (`AuthError`), token (`TokenError`) e mosse (`MoveError`), restituendo
 * un codice di stato HTTP e un messaggio di errore appropriato.
 *
 * @param err - L'oggetto dell'errore, che può essere di tipo `GameError`, `AuthError`, `TokenError`, `MoveError` o un errore generico.
 * @param req - L'oggetto `Request` di Express.
 * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
 * @param next - La funzione `NextFunction` di Express per passare il controllo al middleware successivo.
 *
 * @returns {void} - Restituisce una risposta JSON con il codice di stato e il messaggio di errore appropriato per ciascun tipo di errore.
 *
 *  * @errorCodes
 *  * - **400** - Richiesta errata: parametri mancanti o valori non validi.
 *  * - **401** - Non autorizzato: credenziali o token mancanti o non validi.
 *  * - **403** - Accesso negato: tentativo di accesso non consentito.
 *  * - **404** - Risorsa non trovata: oggetto o entità specificata non trovata.
 *  * - **409** - Conflitto: azione non consentita a causa di uno stato attuale (es. partita già in corso).
 *  * - **422** - Entità non processabile: dati validi dal punto di vista sintattico ma con errori logici.
 *  * - **500** - Errore interno del server: errore generico per errori non gestiti specificamente.
 */

import {NextFunction, Request, Response} from 'express';
import {GameError, gameErrorType} from './gameFactory';
import {AuthError, authErrorType} from './authFactory';
import {TokenError, tokenErrorType} from "./tokenFactory";
import {MoveError, moveErrorType} from "./moveFactory";

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof GameError) {
        let statusCode: number;
        switch (err.type) {
            case gameErrorType.MISSING_PLAYER_ID:
                statusCode = 400;
                break;
            case gameErrorType.INVALID_DIFFICULTY:
                statusCode = 400;
                break;
            case gameErrorType.INVALID_GAME_PARAMETERS:
                statusCode = 422;
                break;
            case gameErrorType.MISSING_GAME_PARAMETERS:
                statusCode = 400;
                break;
            case gameErrorType.OPPONENT_NOT_FOUND:
                statusCode = 404;
                break;
            case gameErrorType.PLAYER_ALREADY_IN_GAME:
                statusCode = 409;
                break;
            case gameErrorType.OPPONENT_ALREADY_IN_GAME:
                statusCode = 409;
                break;
            case gameErrorType.SELF_CHALLENGE_NOT_ALLOWED:
                statusCode = 400;
                break;
            case gameErrorType.GAME_NOT_IN_PROGRESS:
                statusCode = 409;
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
            case gameErrorType.GAME_NOT_FOUND:
                statusCode = 404;
                break;
            case gameErrorType.ONLY_WINNER:
                statusCode = 400;
                break;
            case gameErrorType.GAME_IN_PROGRESS:
                statusCode = 400;
                break;
            default:
                statusCode = 500;
                break;
        }
        res.status(statusCode).json({ error: err.message});
    } else if (err instanceof AuthError) {
        let statusCode: number;
        switch (err.type) {
            case authErrorType.INVALID_CREDENTIALS:
                statusCode = 401;
                break;
            case authErrorType.TOKEN_EXPIRED:
                statusCode = 401;
                break;
            case authErrorType.UNAUTHORIZED:
                statusCode = 403;
                break;
            case authErrorType.NOT_VALID_TOKEN:
                statusCode = 401;
                break;
            case authErrorType.NEED_AUTHORIZATION:
                statusCode = 401;
                break;
            default:
                statusCode = 500;
                break;
        }
        res.status(statusCode).json({ error: err.message});
    } else if (err instanceof TokenError) {
        let statusCode: number;
        switch (err.type) {
            case tokenErrorType.ADMIN_AUTHORIZATION:
                statusCode = 403;
                break;
            case tokenErrorType.MISSING_PARAMETERS:
                statusCode = 400;
                break;
            case tokenErrorType.USER_NOT_FOUND:
                statusCode = 404;
                break;
            case tokenErrorType.POSITIVE_TOKEN:
                statusCode = 422;
                break;
            default:
                statusCode = 500;
                break;
        }
        res.status(statusCode).json({error: err.message});
    } else if (err instanceof MoveError) {
        let statusCode: number;
        switch (err.type) {
            case moveErrorType.GAME_NOT_FOUND:
                statusCode = 404;
                break;
            case moveErrorType.FAILED_PARSING:
                statusCode = 400;
                break;
            case moveErrorType.NOT_VALID_ARRAY:
                statusCode = 422;
                break;
            case moveErrorType.NOT_VALID_MOVE:
                statusCode = 422;
                break;
            case moveErrorType.MISSING_PARAMS:
                statusCode = 400;
                break;
            case moveErrorType.NO_MOVES:
                statusCode = 404;
                break;
            case moveErrorType.INVALID_FORMAT:
                statusCode = 404;
                break;
            default:
                statusCode = 500;
                break;
        }
        res.status(statusCode).json({error: err.message});
    } else {
        // Gestione di errori generici non riconosciuti
        res.status(500).json({ error: 'Unknown error occurred.' });
    }
}

export default errorHandler;
