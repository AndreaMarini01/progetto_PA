/**
 * Enumerazione `gameErrorType` che rappresenta i diversi tipi di errori relativi al gioco.
 *
 * @enum {string}
 * @property {string} MISSING_PLAYER_ID - L'ID del giocatore è mancante.
 * @property {string} INVALID_DIFFICULTY - Difficoltà selezionata non valida.
 * @property {string} INVALID_GAME_PARAMETERS - Parametri del gioco non validi; non si possono specificare sia l'avversario che la difficoltà dell'IA.
 * @property {string} MISSING_GAME_PARAMETERS - Parametri di gioco mancanti.
 * @property {string} INSUFFICIENT_CREDIT - Credito insufficiente per creare una partita.
 * @property {string} OPPONENT_NOT_FOUND - Avversario non trovato.
 * @property {string} PLAYER_ALREADY_IN_GAME - Il giocatore è già in una partita attiva.
 * @property {string} OPPONENT_ALREADY_IN_GAME - L'avversario è già in una partita attiva.
 * @property {string} SELF_CHALLENGE_NOT_ALLOWED - Il giocatore non può sfidare se stesso.
 * @property {string} GAME_NOT_IN_PROGRESS - La partita non è più disponibile.
 * @property {string} INVALID_DATE - Data non valida.
 * @property {string} MISSING_DATE - Data di inizio o fine mancante.
 * @property {string} INVALID_DATE_RANGE - La data di inizio deve essere precedente alla data di fine.
 * @property {string} GAME_NOT_FOUND - Partita non trovata.
 * @property {string} ONLY_WINNER - Solo il vincitore della partita può ottenere il certificato.
 * @property {string} GAME_IN_PROGRESS - La partita è ancora in corso.
 */

export enum gameErrorType {
    MISSING_PLAYER_ID = 'MISSING_PLAYER_ID',
    INVALID_DIFFICULTY = 'INVALID_DIFFICULTY',
    INVALID_GAME_PARAMETERS = 'INVALID_GAME_PARAMETERS',
    MISSING_GAME_PARAMETERS = 'MISSING_GAME_PARAMETERS',
    INSUFFICIENT_CREDIT = 'INSUFFICIENT_CREDIT',
    OPPONENT_NOT_FOUND = 'OPPONENT_NOT_FOUND',
    PLAYER_ALREADY_IN_GAME = 'PLAYER_ALREADY_IN_GAME',
    OPPONENT_ALREADY_IN_GAME = 'OPPONENT_ALREADY_IN_GAME',
    SELF_CHALLENGE_NOT_ALLOWED = 'SELF_CHALLENGE_NOT_ALLOWED',
    GAME_NOT_IN_PROGRESS = 'GAME_NOT_IN_PROGRESS',
    INVALID_DATE = 'INVALID_DATE',
    MISSING_DATE = 'MISSING_DATE',
    INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    ONLY_WINNER = 'ONLY_WINNER',
    GAME_IN_PROGRESS = 'GAME_IN_PROGRESS',
}

/**
 * Classe `GameError` per gestire gli errori relativi al gioco personalizzati.
 * Estende la classe `Error` e include un tipo di errore di gioco (`gameErrorType`).
 *
 * @extends Error
 *
 * @property {gameErrorType} type - Tipo di errore di gioco.
 *
 * @constructor
 * @param {gameErrorType} type - Tipo di errore di gioco.
 * @param {string} message - Messaggio dettagliato dell'errore.
 */

class GameError extends Error {
    type: gameErrorType;

    constructor(type: gameErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'GameError';
    }
}

/**
 * Classe `GameFactory` per la creazione di errori di gioco (`GameError`) in base al tipo di errore.
 *
 * @method getErrorMessage - Ritorna un messaggio di errore specifico in base al tipo di errore di gioco.
 * @param {gameErrorType} errorType - Tipo di errore di gioco.
 * @returns {string} - Messaggio di errore corrispondente.
 *
 * @method createError - Crea un'istanza di `GameError` in base al tipo di errore specificato.
 * @param {gameErrorType} errorType - Tipo di errore di gioco.
 * @returns {GameError} - Istanza di `GameError` con tipo e messaggio specifici.
 */

class GameFactory {

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
                return 'The requesting player is already in an active game.';
            case gameErrorType.OPPONENT_ALREADY_IN_GAME:
                return 'The opponent is already in an active game.';
            case gameErrorType.SELF_CHALLENGE_NOT_ALLOWED:
                return 'You can\'t challenge yourself!';
            case gameErrorType.GAME_NOT_IN_PROGRESS:
                return 'The game is not more available.';
            case gameErrorType.INVALID_DATE:
                return 'The provided date is not valid. Please ensure the date is in the correct format (YYYY-MM-DD) and is a valid calendar date.';
            case gameErrorType.MISSING_DATE:
                return 'Start date or end date is missing.';
            case gameErrorType.INVALID_DATE_RANGE:
                return 'Start date must be lower than end date!';
            case gameErrorType.GAME_NOT_FOUND:
                return 'Game not found.';
            case gameErrorType.ONLY_WINNER:
                return 'Only the winner of the match can obtain the certificate!';
            case gameErrorType.GAME_IN_PROGRESS:
                return 'The game is in progress yet.';
            default:
                return 'An unknown game error occurred.';
        }
    }

    static createError(errorType: gameErrorType): GameError {
        const message = this.getErrorMessage(errorType);
        return new GameError(errorType, message);
    }
}

export default GameFactory;
export {GameError};
