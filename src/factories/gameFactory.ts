/*
export enum gameErrorType {
    MISSING_PLAYER_ID = 'MISSING_PLAYER_ID',
    INVALID_DIFFICULTY = 'INVALID_DIFFICULTY',
    INVALID_GAME_PARAMETERS = 'INVALID_GAME_PARAMETERS',
    MISSING_GAME_PARAMETERS = 'MISSING_GAME_PARAMETERS',
    INSUFFICIENT_CREDIT = 'INSUFFICIENT_CREDIT',
    OPPONENT_NOT_FOUND = 'OPPONENT_NOT_FOUND'
}

class GameFactory {
    static getErrorMessage(errorType: gameErrorType): string {
        switch (errorType) {
            case gameErrorType.MISSING_PLAYER_ID:
                return "Player's id is missing!";
            case gameErrorType.INVALID_DIFFICULTY:
                return 'Invalid difficulty level.';
            case gameErrorType.INVALID_GAME_PARAMETERS:
                return "You can specify either the opponent's email or the AI difficulty, but not both.";
            case gameErrorType.MISSING_GAME_PARAMETERS:
                return "You must specify the opponent's email or the AI difficulty level.";
            case gameErrorType.INSUFFICIENT_CREDIT:
                return 'Insufficient credit to create a match.';
            case gameErrorType.OPPONENT_NOT_FOUND:
                return 'Opponent not found.';
            default:
                return 'Unknown error.';
        }
    }

    static createError(errorType: gameErrorType): Error {
        const message = this.getErrorMessage(errorType);
        const error = new Error(message);
        (error as any).type = errorType; // Imposta il tipo di errore personalizzato
        return error;
    }
}

export default GameFactory;
*/

// src/factories/gameFactory.ts
export enum gameErrorType {
    MISSING_PLAYER_ID = 'MISSING_PLAYER_ID',
    INVALID_DIFFICULTY = 'INVALID_DIFFICULTY',
    INVALID_GAME_PARAMETERS = 'INVALID_GAME_PARAMETERS',
    MISSING_GAME_PARAMETERS = 'MISSING_GAME_PARAMETERS',
    INSUFFICIENT_CREDIT = 'INSUFFICIENT_CREDIT',
    OPPONENT_NOT_FOUND = 'OPPONENT_NOT_FOUND',
    PLAYER_ALREADY_IN_GAME = 'PLAYER_ALREADY_IN_GAME',
    OPPONENT_ALREADY_IN_GAME = 'OPPONENT_ALREADY_IN_GAME',
    SELF_CHALLENGE_NOT_ALLOWED = 'SELF_CHALLENGE_NOT_ALLOWED'
}

// Classe di errore personalizzata per gli errori di gioco
class GameError extends Error {
    type: gameErrorType;

    constructor(type: gameErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'GameError';
    }
}

class GameFactory {
    // Restituisce un messaggio di errore in base al tipo di errore
    static getErrorMessage(errorType: gameErrorType): string {
        switch (errorType) {
            case gameErrorType.MISSING_PLAYER_ID:
                return "Player's ID is missing!";
            case gameErrorType.INVALID_DIFFICULTY:
                return 'Invalid difficulty level.';
            case gameErrorType.INVALID_GAME_PARAMETERS:
                return "You can specify either the opponent's email or the AI difficulty, but not both.";
            case gameErrorType.MISSING_GAME_PARAMETERS:
                return "You must specify the opponent's email or the AI difficulty level.";
            case gameErrorType.INSUFFICIENT_CREDIT:
                return 'Insufficient credit to create a match.';
            case gameErrorType.OPPONENT_NOT_FOUND:
                return 'Opponent not found.';
            case gameErrorType.PLAYER_ALREADY_IN_GAME:
                return 'The requesting player is already in an active game';
            case gameErrorType.OPPONENT_ALREADY_IN_GAME:
                return 'The opponent is already in an active game';
            case gameErrorType.SELF_CHALLENGE_NOT_ALLOWED:
                return 'You can\'t challenge yourself!';
            default:
                return 'An unknown error occurred.';
        }
    }

    // Crea un'istanza di GameError con il tipo e il messaggio appropriato
    static createError(errorType: gameErrorType): GameError {
        const message = this.getErrorMessage(errorType);
        return new GameError(errorType, message);
    }
}

export default GameFactory;
//export { GameError, gameErrorType };
export {GameError};
