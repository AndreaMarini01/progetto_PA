// Variabile di tipo ENUM che permette di gestire i vari errori
export enum authErrorType {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    UNAUTHORIZED = 'UNAUTHORIZED'
}

/*
// Classe che estende la classe Error per gli errori personalizzati
class AuthError extends Error {
    public statusCode: number;
    constructor(message: string | undefined) {
        super(message);
        this.name = 'AuthError';
        this.statusCode = 401; // Default per l'errore di autenticazione
    }
}

// Classe per l'errore relativo alle credenziali
class InvalidCredentialsError extends AuthError {
    constructor() {
        super('Invalid credentials.');
        this.name = 'InvalidCredentialsError';
        this.statusCode = 401;
    }
}

// Classe per l'errore relativo al token
class TokenExpiredError extends AuthError {
    constructor() {
        super('Your token is expired.');
        this.name = 'TokenExpiredError';
        this.statusCode = 401;
    }
}

// Switch per la gestione degli errori
class AuthErrorFactory {
    static createError(type: any) {
        switch (type) {
            case 'InvalidCredentials':
                return new InvalidCredentialsError();
            case 'TokenExpired':
                return new TokenExpiredError();
            default:
                return new Error('Unknown error occurred.');
        }
    }
}

export { AuthError, InvalidCredentialsError, TokenExpiredError, AuthErrorFactory };

 */

class AuthFactory {
    static getErrorMessage(errorType: authErrorType): string {
        switch (errorType) {
            case authErrorType.INVALID_CREDENTIALS:
                return 'Invalid Credentials. Try again.';
            case authErrorType.TOKEN_EXPIRED:
                return 'Your token expired. Please, log again.';
            case authErrorType.UNAUTHORIZED:
                return 'You class unauthorized. Try again.';
            default:
                return 'Unknown error type';
        }
    }

    static createError(errorType: authErrorType): Error {
        const message = this.getErrorMessage(errorType);
        const error = new Error(message);
        (error as any).type = errorType; // Imposta il tipo di errore personalizzato
        return error;
    }
}

export default AuthFactory;