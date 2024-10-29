/**
 * Enumerazione che definisce i tipi di errore di gioco.
 *
 * I valori rappresentano vari scenari di errore che possono verificarsi durante
 * la creazione o la gestione di una partita, come l'assenza di ID del giocatore,
 * difficoltà non valida, parametri mancanti o avversario non trovato.
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
 * Classe di errore personalizzata per gli errori di gioco.
 *
 * Estende la classe `Error` di JavaScript per rappresentare errori specifici
 * relativi alla creazione o gestione delle partite. Include un tipo di errore
 * che indica il tipo di problema verificatosi.
 */

class GameError extends Error {
    type: gameErrorType;

    /**
     * Costruisce un nuovo oggetto `GameError`.
     *
     * @param {gameErrorType} type - Il tipo di errore di gioco.
     * @param {string} message - Il messaggio di errore descrittivo.
     */

    constructor(type: gameErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'GameError';
    }
}

/**
 * Classe per creare e gestire errori di gioco.
 *
 * `GameFactory` fornisce metodi statici per ottenere messaggi di errore
 * e creare oggetti `GameError` in base al tipo di errore di gioco.
 */

class GameFactory {

    /**
     * Restituisce un messaggio di errore in base al tipo di errore di gioco.
     *
     * @param {gameErrorType} errorType - Il tipo di errore di gioco.
     * @returns {string} Il messaggio di errore corrispondente.
     */

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
            case gameErrorType.GAME_NOT_IN_PROGRESS:
                return 'The game is not more available.';
            case gameErrorType.INVALID_DATE:
                return 'The provided date is not valid. Please ensure the date is in the correct format (YYYY-MM-DD) and is a valid calendar date.';
            case gameErrorType.MISSING_DATE:
                return 'Start date or end date is missing';
            case gameErrorType.INVALID_DATE_RANGE:
                return 'Start date must be lower than end date!';
            case gameErrorType.GAME_NOT_FOUND:
                return 'Game not found.';
            case gameErrorType.ONLY_WINNER:
                return 'Only the winner of the match can obtain the certificate!';
            case gameErrorType.GAME_IN_PROGRESS:
                return 'The game is in progress yet';
            default:
                return 'An unknown error occurred.';
        }
    }

    /**
     * Crea un'istanza di `GameError` con il tipo e il messaggio appropriato.
     *
     * @param {gameErrorType} errorType - Il tipo di errore di gioco.
     * @returns {GameError} Un oggetto `GameError` con il tipo di errore e il messaggio corrispondente.
     */

    static createError(errorType: gameErrorType): GameError {
        const message = this.getErrorMessage(errorType);
        return new GameError(errorType, message);
    }
}

export default GameFactory;
export {GameError};
