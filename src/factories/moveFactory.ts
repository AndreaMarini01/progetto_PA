export enum moveErrorType {
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    FAILED_PARSING = 'FAILED_PARSING',
    NOT_VALID_ARRAY = 'NOT_VALID_ARRAY',
    NOT_VALID_MOVE = 'NOT_VALID_MOVE',
    MISSING_PARAMS = 'MISSING_PARAMS',
}

class MoveError extends Error {
    type: moveErrorType;

    constructor(type: moveErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'MoveError';
    }
}

class MoveFactory {
    // Restituisce un messaggio di errore in base al tipo di errore di autenticazione
    static getErrorMessage(errorType: moveErrorType): string {
        switch (errorType) {
            case moveErrorType.GAME_NOT_FOUND:
                return 'The game doesn\'t exist!';
            case moveErrorType.FAILED_PARSING:
                return 'The parsing of the board has failed';
            case moveErrorType.NOT_VALID_ARRAY:
                return 'The board\' array is not valid!';
            case moveErrorType.NOT_VALID_MOVE:
                return 'The move is not valid!';
            case moveErrorType.MISSING_PARAMS:
                return 'You have to specify the game id, from and to!'
            default:
                return 'An unknown authentication error occurred.';
        }
    }

    // Crea un'istanza di AuthError con il tipo e il messaggio appropriato
    static createError(errorType: moveErrorType): MoveError {
        const message = this.getErrorMessage(errorType);
        return new MoveError(errorType, message);
    }
}

export default MoveFactory;
export { MoveError };

