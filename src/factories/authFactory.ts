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