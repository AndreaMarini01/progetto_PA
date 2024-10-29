/**
 * Enumerazione che definisce i tipi di errore di mossa.
 *
 * I valori rappresentano vari scenari di errore che possono verificarsi durante
 * l'esecuzione di una mossa, come la mancanza di parametri, un gioco non trovato,
 * o la mossa non valida.
 */

export enum moveErrorType {
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    FAILED_PARSING = 'FAILED_PARSING',
    NOT_VALID_ARRAY = 'NOT_VALID_ARRAY',
    NOT_VALID_MOVE = 'NOT_VALID_MOVE',
    MISSING_PARAMS = 'MISSING_PARAMS',
    NO_MOVES = 'NO_MOVES',
}

/**
 * Classe di errore personalizzata per gli errori di mossa.
 *
 * Estende la classe `Error` di JavaScript per rappresentare errori specifici
 * relativi all'esecuzione delle mosse. Include un tipo di errore che indica
 * il tipo di problema verificatosi.
 */

class MoveError extends Error {
    type: moveErrorType;

    /**
     * Costruisce un nuovo oggetto `MoveError`.
     *
     * @param {moveErrorType} type - Il tipo di errore di mossa.
     * @param {string} message - Il messaggio di errore descrittivo.
     */

    constructor(type: moveErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'MoveError';
    }
}

/**
 * Classe per creare e gestire errori di mossa.
 *
 * `MoveFactory` fornisce metodi statici per ottenere messaggi di errore
 * e creare oggetti `MoveError` in base al tipo di errore di mossa.
 */

class MoveFactory {

    /**
     * Restituisce un messaggio di errore in base al tipo di errore di mossa.
     *
     * @param {moveErrorType} errorType - Il tipo di errore di mossa.
     * @returns {string} Il messaggio di errore corrispondente.
     */

    static getErrorMessage(errorType: moveErrorType): string {
        switch (errorType) {
            case moveErrorType.GAME_NOT_FOUND:
                return 'The game doesn\'t exist!';
            case moveErrorType.FAILED_PARSING:
                return 'The parsing of the board has failed';
            case moveErrorType.NOT_VALID_ARRAY:
                return 'The board\'s conversion is not valid!';
            case moveErrorType.NOT_VALID_MOVE:
                return 'The move is not valid!';
            case moveErrorType.MISSING_PARAMS:
                return 'You have to specify the game id, from and to!';
            case moveErrorType.NO_MOVES:
                return 'There are no moves for this game';
            default:
                return 'An unknown authentication error occurred.';
        }
    }

    /**
     * Crea un'istanza di `MoveError` con il tipo e il messaggio appropriato.
     *
     * @param {moveErrorType} errorType - Il tipo di errore di mossa.
     * @returns {MoveError} Un oggetto `MoveError` con il tipo di errore e il messaggio corrispondente.
     */

    static createError(errorType: moveErrorType): MoveError {
        const message = this.getErrorMessage(errorType);
        return new MoveError(errorType, message);
    }
}

export default MoveFactory;
export { MoveError };

