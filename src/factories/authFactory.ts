/**
 * Enumerazione che definisce i tipi di errore di autenticazione.
 *
 * I valori rappresentano vari scenari di errore che possono verificarsi durante
 * l'autenticazione, come credenziali non valide, token scaduto o mancanza di autorizzazione.
 */

export enum authErrorType {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    UNAUTHORIZED = 'UNAUTHORIZED',
    NOT_VALID_TOKEN = 'NOT_VALID_TOKEN',
    NEED_AUTHORIZATION = 'NEED_AUTHORIZATION'
}

/**
 * Classe di errore personalizzata per gli errori di autenticazione.
 *
 * Estende la classe `Error` di JavaScript per rappresentare errori specifici
 * relativi all'autenticazione. Include un tipo di errore che indica il tipo
 * di problema verificatosi.
 */

class AuthError extends Error {
    type: authErrorType;

    /**
     * Costruisce un nuovo oggetto `AuthError`.
     *
     * @param {authErrorType} type - Il tipo di errore di autenticazione.
     * @param {string} message - Il messaggio di errore descrittivo.
     */

    constructor(type: authErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'AuthError';
    }
}

/**
 * Classe per creare e gestire errori di autenticazione.
 *
 * `AuthFactory` fornisce metodi statici per ottenere messaggi di errore
 * e creare oggetti `AuthError` in base al tipo di errore di autenticazione.
 */

class AuthFactory {

    /**
     * Restituisce un messaggio di errore in base al tipo di errore di autenticazione.
     *
     * @param {authErrorType} errorType - Il tipo di errore di autenticazione.
     * @returns {string} Il messaggio di errore corrispondente.
     */

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
                return 'You need to authenticate';
            default:
                return 'An unknown authentication error occurred.';
        }
    }

    /**
     * Crea un'istanza di `AuthError` con il tipo e il messaggio appropriato.
     *
     * @param {authErrorType} errorType - Il tipo di errore di autenticazione.
     * @returns {AuthError} Un oggetto `AuthError` con il tipo di errore e il messaggio corrispondente.
     */

    static createError(errorType: authErrorType): AuthError {
        const message = this.getErrorMessage(errorType);
        return new AuthError(errorType, message);
    }
}

export default AuthFactory;
export { AuthError };

