import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Player from '../models/Player';
import { verifyPassword } from '../utils/cryptoUtils'; // Importa la funzione per la verifica della password
import AuthFactory, { authErrorType } from '../factories/authFactory';
import validator from 'validator';

/**
 * Classe `authController` per gestire le operazioni di autenticazione.
 *
 * Contiene metodi per l'autenticazione, come il login degli utenti.
 */

class authController {

    /**
     * Gestisce l'autenticazione dell'utente e restituisce un token JWT in caso di successo.
     *
     * @param req - L'oggetto `Request` di Express contenente `email` e `password` nel corpo della richiesta.
     *   - `email` (string) - L'email dell'utente che sta tentando di accedere.
     *   - `password` (string) - La password dell'utente che sta tentando di accedere.
     * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
     *   - Risponde con un token JWT in caso di autenticazione riuscita.
     * @param next - La funzione `NextFunction` di Express utilizzata per gestire eventuali errori.
     *
     * @returns `Promise<void>` - Non restituisce un valore diretto, ma invia una risposta JSON contenente il token JWT o passa l'errore al middleware di gestione degli errori.
     *
     * @throws {AuthError} - Genera un errore se:
     *   - `email` o `password` sono assenti nel corpo della richiesta.
     *   - L'email fornita non è valida.
     *   - Le credenziali non sono valide o l'utente non è trovato.
     */

    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        // Converte l'email in minuscolo, se presente
        if (req.body.email && typeof req.body.email === 'string') {
            req.body.email = req.body.email.toLowerCase();
        }
        const { email, password } = req.body;
        try {
            if (!email || !password) {
                throw AuthFactory.createError(authErrorType.INVALID_CREDENTIALS);
            }

            if (!validator.isEmail(email)) {
                throw AuthFactory.createError(authErrorType.INVALID_CREDENTIALS);
            }

            // Cerca l'utente nel database utilizzando l'email
            const user = await Player.findOne({ where: { email } });
            if (!user) {
                throw AuthFactory.createError(authErrorType.INVALID_CREDENTIALS);
            }
            // Verifica la password fornita con l'hash salvato e il salt
            const isPasswordValid = verifyPassword(password, user.password_hash, user.salt);
            if (!isPasswordValid) {
                throw AuthFactory.createError(authErrorType.INVALID_CREDENTIALS);
            }
            // Genera un token JWT per l'utente autenticato
            const token = jwt.sign(
                { player_id: user.player_id, email: user.email, role: user.role },
                process.env.JWT_SECRET as string,
                { expiresIn: '1h' }
            );
            // Restituisce il token JWT all'utente
            res.json({ token });
        } catch (error) {
            next(error);
        }
    }
}

export default new authController();
