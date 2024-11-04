/**
 * Enumerazione `authErrorType` che rappresenta i diversi tipi di errori di autenticazione.
 *
 * @enum {string}
 * @property {string} INVALID_CREDENTIALS - Credenziali non valide fornite.
 * @property {string} TOKEN_EXPIRED - Il token di autenticazione è scaduto.
 * @property {string} UNAUTHORIZED - Azione non autorizzata.
 * @property {string} NOT_VALID_TOKEN - Il token fornito non è valido.
 * @property {string} NEED_AUTHORIZATION - È necessaria l'autenticazione.
 */

export enum authErrorType {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    UNAUTHORIZED = 'UNAUTHORIZED',
    NOT_VALID_TOKEN = 'NOT_VALID_TOKEN',
    NEED_AUTHORIZATION = 'NEED_AUTHORIZATION'
}

/**
 * Classe `AuthError` per gestire gli errori di autenticazione personalizzati.
 * Estende la classe `Error` e include un tipo di errore di autenticazione (`authErrorType`).
 *
 * @extends Error
 *
 * @property {authErrorType} type - Tipo di errore di autenticazione.
 *
 * @constructor
 * @param {authErrorType} type - Tipo di errore di autenticazione.
 * @param {string} message - Messaggio dettagliato dell'errore.
 */

class AuthError extends Error {
    type: authErrorType;

    constructor(type: authErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'AuthError';
    }
}

/**
 * Classe `AuthFactory` per la creazione di errori di autenticazione (`AuthError`) in base al tipo di errore.
 *
 * @method static getErrorMessage - Ritorna un messaggio di errore specifico in base al tipo di errore di autenticazione.
 * @param {authErrorType} errorType - Tipo di errore di autenticazione.
 * @returns {string} - Messaggio di errore corrispondente.
 *
 * @method static createError - Crea un'istanza di `AuthError` in base al tipo di errore specificato.
 * @param {authErrorType} errorType - Tipo di errore di autenticazione.
 * @returns {AuthError} - Istanza di `AuthError` con tipo e messaggio specifici.
 */

class AuthFactory {

    static getErrorMessage(errorType: authErrorType): string {
        switch (errorType) {
            case authErrorType.INVALID_CREDENTIALS:
                return 'Invalid credentials provided.';
            case authErrorType.TOKEN_EXPIRED:
                return 'The token has expired.';
            case authErrorType.UNAUTHORIZED:
                return 'You are not authorized to perform this action.';
            case authErrorType.NOT_VALID_TOKEN:
                return 'Not valid token.';
            case authErrorType.NEED_AUTHORIZATION:
                return 'You need to authenticate.';
            default:
                return 'An unknown authentication error occurred.';
        }
    }

    static createError(errorType: authErrorType): AuthError {
        const message = this.getErrorMessage(errorType);
        return new AuthError(errorType, message);
    }
}

export default AuthFactory;
export { AuthError };

