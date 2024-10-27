import crypto from 'crypto';

/**
 * Verifica se una password fornita corrisponde all'hash memorizzato, utilizzando il salt specificato.
 *
 * La funzione utilizza l'algoritmo PBKDF2 con SHA-256 per generare un hash della password fornita,
 * confrontandolo con l'hash memorizzato per verificare la corrispondenza.
 *
 * @param {string} password - La password in chiaro fornita dall'utente.
 * @param {string} hash - L'hash memorizzato della password.
 * @param {string} salt - Il salt utilizzato durante l'hashing della password.
 * @returns {boolean} Restituisce `true` se la password fornita corrisponde all'hash, altrimenti `false`.
 */

export const verifyPassword = (password: string, hash: string, salt: string) => {
    const hashToCompare = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return hash === hashToCompare;
};

