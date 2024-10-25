// src/factories/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { GameError, gameErrorType } from './gameFactory';
import { AuthError,  authErrorType } from './authFactory';
import {TokenError, tokenErrorType} from "./tokenFactory";

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
                statusCode = 400; // Bad Request
                break;
            case gameErrorType.MISSING_GAME_PARAMETERS:
                statusCode = 400; // Bad Request
                break;
            case gameErrorType.OPPONENT_NOT_FOUND:
                statusCode = 404; // Not Found
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
                statusCode = 401
                break;
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
        res.status(statusCode).json({ error: err.message});
    } else if (err instanceof TokenError) {
        let statusCode: number;
        switch (err.type) {
            case tokenErrorType.ADMIN_AUTHORIZATION:
                statusCode = 401
                break;
            case tokenErrorType.MISSING_PARAMETERS:
                statusCode = 401; // Forbidden
                break;
            case tokenErrorType.USER_NOT_FOUND:
                statusCode = 403; // Forbidden
                break;
            default:
                statusCode = 500; // Internal Server Error
                break;
        }
        res.status(statusCode).json({error: err.message});
    } else {
        // Gestione di errori generici non riconosciuti
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default errorHandler;
