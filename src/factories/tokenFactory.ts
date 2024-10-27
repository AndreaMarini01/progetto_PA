/**
 * Enumerazione che definisce i tipi di errore relativi ai token.
 *
 * I valori rappresentano vari scenari di errore che possono verificarsi durante
 * la gestione dei token, come parametri mancanti, utente non trovato o autorizzazione
 * richiesta per un'operazione amministrativa.
 */

export enum tokenErrorType {
    MISSING_PARAMETERS = 'MISSING_PARAMETERS',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    ADMIN_AUTHORIZATION = 'ADMIN_AUTHORIZATION',
    POSITIVE_TOKEN = 'POSITIVE_TOKEN',
}

/**
 * Classe di errore personalizzata per gli errori relativi ai token.
 *
 * Estende la classe `Error` di JavaScript per rappresentare errori specifici
 * relativi alla gestione dei token. Include un tipo di errore che indica
 * il tipo di problema verificatosi.
 */

class TokenError extends Error {
    type: tokenErrorType;

    /**
     * Costruisce un nuovo oggetto `TokenError`.
     *
     * @param {tokenErrorType} type - Il tipo di errore relativo ai token.
     * @param {string} message - Il messaggio di errore descrittivo.
     */

    constructor(type: tokenErrorType, message: string) {
        super(message);
        this.type = type;
        this.name = 'TokenError';
    }
}

/**
 * Classe di fabbrica per creare e gestire errori relativi ai token.
 *
 * `TokenFactory` fornisce metodi statici per ottenere messaggi di errore
 * e creare oggetti `TokenError` in base al tipo di errore relativo ai token.
 */

class TokenFactory {

    /**
     * Restituisce un messaggio di errore in base al tipo di errore relativo ai token.
     *
     * @param {tokenErrorType} errorType - Il tipo di errore relativo ai token.
     * @returns {string} Il messaggio di errore corrispondente.
     */

    static getErrorMessage(errorType: tokenErrorType): string {
        switch (errorType) {
            case tokenErrorType.MISSING_PARAMETERS:
                return "Email and Tokens are required.";
            case tokenErrorType.USER_NOT_FOUND:
                return "User not found.";
            case tokenErrorType.ADMIN_AUTHORIZATION:
                return "You must be an admin to charge Tokens.";
            case tokenErrorType.POSITIVE_TOKEN:
                return 'You can only add tokens!';
            default:
                return "Unknown error.";
        }
    }

    /**
     * Crea un'istanza di `TokenError` con il tipo e il messaggio appropriato.
     *
     * @param {tokenErrorType} errorType - Il tipo di errore relativo ai token.
     * @returns {TokenError} Un oggetto `TokenError` con il tipo di errore e il messaggio corrispondente.
     */

    static createError(errorType: tokenErrorType): TokenError {
        const message = this.getErrorMessage(errorType);
        return new TokenError(errorType, message);
    }
}

export default TokenFactory;
export {TokenError};