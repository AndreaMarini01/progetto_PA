/**
 * Enumerazione `moveErrorType` che rappresenta i diversi tipi di errori relativi alle mosse di gioco.
 *
 * @enum {string}
 * @property {string} GAME_NOT_FOUND - La partita specificata non è stata trovata.
 * @property {string} FAILED_PARSING - Errore durante il parsing della board di gioco.
 * @property {string} NOT_VALID_ARRAY - Conversione della board non valida.
 * @property {string} NOT_VALID_MOVE - La mossa non è valida.
 * @property {string} MISSING_PARAMS - Parametri mancanti nella richiesta della mossa (es. ID della partita, `from`, `to`).
 * @property {string} NO_MOVES - Nessuna mossa disponibile per la partita specificata.
 * @property {string} INVALID_FORMAT - Formato richiesto non valido.
 * @property {string} NOT_PLAYER_TURN - Non è il turno del giocatore.
 * @property {string} TIME_OUT - Troppo tempo impiegato.
 */

export enum moveErrorType {
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    FAILED_PARSING = 'FAILED_PARSING',
    NOT_VALID_ARRAY = 'NOT_VALID_ARRAY',
    NOT_VALID_MOVE = 'NOT_VALID_MOVE',
    MISSING_PARAMS = 'MISSING_PARAMS',
    NO_MOVES = 'NO_MOVES',
    INVALID_FORMAT = 'INVALID_FORMAT',
    NOT_PLAYER_TURN = 'NOT_PLAYER_TURN',
    TIME_OUT = 'TIME_OUT',
}

/**
 * Classe `MoveError` per gestire gli errori relativi alle mosse di gioco.
 * Estende la classe `Error` e include un tipo di errore di mossa (`moveErrorType`).
 *
 * @extends Error
 *
 * @property {moveErrorType} type - Tipo di errore di mossa.
 *
 * @constructor
 * @param {moveErrorType} type - Tipo di errore di mossa.
 * @param {string} message - Messaggio dettagliato dell'errore.
 */

class MoveError extends Error {
    type: moveErrorType;

    constructor(type: moveErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'MoveError';
    }
}

/**
 * Classe `MoveFactory` per la creazione di errori di mossa (`MoveError`) in base al tipo di errore.
 *
 * @method getErrorMessage - Ritorna un messaggio di errore specifico in base al tipo di errore di mossa.
 * @param {moveErrorType} errorType - Tipo di errore di mossa.
 * @returns {string} - Messaggio di errore corrispondente.
 *
 * @method createError - Crea un'istanza di `MoveError` in base al tipo di errore specificato.
 * @param {moveErrorType} errorType - Tipo di errore di mossa.
 * @returns {MoveError} - Istanza di `MoveError` con tipo e messaggio specifici.
 */

class MoveFactory {

    static getErrorMessage(errorType: moveErrorType): string {
        switch (errorType) {
            case moveErrorType.GAME_NOT_FOUND:
                return 'The game doesn\'t exist!';
            case moveErrorType.FAILED_PARSING:
                return 'The parsing of the board has failed.';
            case moveErrorType.NOT_VALID_ARRAY:
                return 'The board\'s conversion is not valid!';
            case moveErrorType.NOT_VALID_MOVE:
                return 'The move is not valid!';
            case moveErrorType.MISSING_PARAMS:
                return 'You have to specify the game id, from and to!';
            case moveErrorType.NO_MOVES:
                return 'There are no moves for this game.';
            case moveErrorType.INVALID_FORMAT:
                return 'Please, provide a valid format.';
            case moveErrorType.NOT_PLAYER_TURN:
                return 'You must wait for your turn to play!';
            case moveErrorType.TIME_OUT:
                return 'The game has ended due to a timeout after 1 minute.';
            default:
                return 'An unknown move error occurred.';
        }
    }

    static createError(errorType: moveErrorType): MoveError {
        const message = this.getErrorMessage(errorType);
        return new MoveError(errorType, message);
    }
}

export default MoveFactory;
export { MoveError };

