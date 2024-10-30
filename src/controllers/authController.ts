import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Player from '../models/Player';
import { verifyPassword } from '../utils/cryptoUtils'; // Importa la funzione per la verifica della password
import AuthFactory, { authErrorType } from '../factories/authFactory';
import validator from 'validator';


/**
 * Classe `AuthController` per gestire le operazioni di autenticazione.
 *
 * Contiene metodi per l'autenticazione, come il login degli utenti.
 */
class authController {
    /**
     * Gestisce il login dell'utente autenticando l'email e la password forniti.
     *
     * Questa funzione verifica le credenziali fornite (email e password) e, se valide, genera un token JWT
     * per l'utente autenticato. Controlla se l'email esiste nel database e verifica la corrispondenza della
     * password. Se le credenziali sono corrette, il token JWT viene restituito. In caso di credenziali non
     * valide o altri errori, viene generato un errore gestito dal middleware di gestione degli errori.
     *
     * @param req - L'oggetto della richiesta Express contenente l'email e la password nel corpo della richiesta.
     * @param res - L'oggetto della risposta Express utilizzato per inviare il token JWT generato al client.
     * @param next - La funzione di callback `NextFunction` per passare il controllo al middleware successivo in caso di errore.
     *
     * @throws {AuthFactory.createError} - Lancia un errore se le credenziali (email o password) sono mancanti o non valide.
     *
     * @returns Una risposta JSON contenente il token JWT se l'autenticazione ha successo. Il token include
     *          informazioni come l'ID dell'utente, l'email e il ruolo, ed è valido per un'ora.
     */
    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
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
