import crypto from 'crypto';

/**
 * Verifica la corrispondenza tra una password e il suo hash utilizzando un algoritmo di derivazione.
 * La funzione genera un hash dalla password e salt forniti, confrontandolo con l'hash originale.
 *
 * @param {string} password - La password in chiaro da verificare.
 * @param {string} hash - L'hash memorizzato della password.
 * @param {string} salt - Il salt utilizzato per generare l'hash.
 * @returns {boolean} - `true` se la password corrisponde all'hash, altrimenti `false`.
 */

export const verifyPassword = (password: string, hash: string, salt: string) => {
    // pbkdf2Sync è la funzione per applicare l'algoritmo di hashing
    // 1000 è il numero di iterazioni dell'algoritmo di hashing
    // 64 sono i byte che compongono l'hash finale
    // sha256 è l'algoritmo di hashing
    const hashToCompare = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    // Confronto tra l'hash nel database e l'hash generato dalla password inserita dall'utente
    return hash === hashToCompare;
};

