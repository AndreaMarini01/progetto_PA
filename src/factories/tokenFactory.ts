export enum tokenErrorType {
    MISSING_PARAMETERS = 'MISSING_PARAMETERS',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    ADMIN_AUTHORIZATION = 'ADMIN_AUTHORIZATION'
}

// Classe di errore personalizzata per gli errori di gioco
class TokenError extends Error {
    type: tokenErrorType;

    constructor(type: tokenErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'TokenError';
    }
}

class TokenFactory {
    // Restituisce un messaggio di errore in base al tipo di errore
    static getErrorMessage(errorType: tokenErrorType): string {
        switch (errorType) {
            case tokenErrorType.MISSING_PARAMETERS:
                return "Email and Tokens are required.";
            case tokenErrorType.USER_NOT_FOUND:
                return "User not found.";
            case tokenErrorType.ADMIN_AUTHORIZATION:
                return "You must be an admin to charge Tokens.";
            default:
                return "Unknown error.";
        }
    }

    // Crea un'istanza di GameError con il tipo e il messaggio appropriato
    static createError(errorType: tokenErrorType): TokenError {
        const message = this.getErrorMessage(errorType);
        return new TokenError(errorType, message);
    }
}

export default TokenFactory;
//export { GameError, gameErrorType };
export {TokenError};