// src/factories/authFactory.ts
export enum authErrorType {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    UNAUTHORIZED = 'UNAUTHORIZED'
}

// Classe di errore personalizzata per gli errori di autenticazione
class AuthError extends Error {
    type: authErrorType;

    constructor(type: authErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'AuthError';
    }
}

class AuthFactory {
    // Restituisce un messaggio di errore in base al tipo di errore di autenticazione
    static getErrorMessage(errorType: authErrorType): string {
        switch (errorType) {
            case authErrorType.INVALID_CREDENTIALS:
                return 'Invalid credentials provided.';
            case authErrorType.TOKEN_EXPIRED:
                return 'The token has expired.';
            case authErrorType.UNAUTHORIZED:
                return 'You are not authorized to perform this action.';
            default:
                return 'An unknown authentication error occurred.';
        }
    }

    // Crea un'istanza di AuthError con il tipo e il messaggio appropriato
    static createError(errorType: authErrorType): AuthError {
        const message = this.getErrorMessage(errorType);
        return new AuthError(errorType, message);
    }
}

export default AuthFactory;
export { AuthError };

