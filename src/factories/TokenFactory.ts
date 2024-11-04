/**
 * Enumerazione `tokenErrorType` che rappresenta i diversi tipi di errori relativi alla gestione dei token.
 *
 * @enum {string}
 * @property {string} MISSING_PARAMETERS - Parametri mancanti nella richiesta (es. email e token).
 * @property {string} USER_NOT_FOUND - Utente non trovato nel database.
 * @property {string} ADMIN_AUTHORIZATION - Autorizzazione amministrativa necessaria per eseguire l'operazione.
 * @property {string} POSITIVE_TOKEN - Solo token positivi possono essere aggiunti.
 */

export enum tokenErrorType {
    MISSING_PARAMETERS = 'MISSING_PARAMETERS',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    ADMIN_AUTHORIZATION = 'ADMIN_AUTHORIZATION',
    POSITIVE_TOKEN = 'POSITIVE_TOKEN',
}

/**
 * Classe `TokenError` per gestire gli errori relativi ai token.
 * Estende la classe `Error` e include un tipo di errore di token (`tokenErrorType`).
 *
 * @extends Error
 *
 * @property {tokenErrorType} type - Tipo di errore di token.
 *
 * @constructor
 * @param {tokenErrorType} type - Tipo di errore di token.
 * @param {string} message - Messaggio dettagliato dell'errore.
 */

class TokenError extends Error {
    type: tokenErrorType;

    constructor(type: tokenErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'TokenError';
    }
}

/**
 * Classe `TokenFactory` per la creazione di errori di token (`TokenError`) in base al tipo di errore.
 *
 * @method getErrorMessage - Ritorna un messaggio di errore specifico in base al tipo di errore di token.
 * @param {tokenErrorType} errorType - Tipo di errore di token.
 * @returns {string} - Messaggio di errore corrispondente.
 *
 * @method createError - Crea un'istanza di `TokenError` in base al tipo di errore specificato.
 * @param {tokenErrorType} errorType - Tipo di errore di token.
 * @returns {TokenError} - Istanza di `TokenError` con tipo e messaggio specifici.
 */

class TokenFactory {

    static getErrorMessage(errorType: tokenErrorType): string {
        switch (errorType) {
            case tokenErrorType.MISSING_PARAMETERS:
                return "Email and Tokens are required.";
            case tokenErrorType.USER_NOT_FOUND:
                return "User not found.";
            case tokenErrorType.ADMIN_AUTHORIZATION:
                return "You must be an admin to charge tokens.";
            case tokenErrorType.POSITIVE_TOKEN:
                return 'You can only add positive tokens!';
            default:
                return "An unknown token error occurred.";
        }
    }

    static createError(errorType: tokenErrorType): TokenError {
        const message = this.getErrorMessage(errorType);
        return new TokenError(errorType, message);
    }
}

export default TokenFactory;
export {TokenError};