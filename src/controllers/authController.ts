import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Player from '../models/Player';
import { verifyPassword } from '../utils/cryptoUtils'; // Importa la funzione per la verifica della password

// import { AuthErrorFactory } from '../factories/authFactory';
import AuthFactory, { authErrorType } from '../factories/authFactory';


// Funzione per gestire il login dell'utente
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
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
            { id: user.id_player, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        // Restituisce il token JWT all'utente
        res.json({ token });
    } catch (error) {
        next(error); // Gestione degli errori tramite il middleware di error handling
    }
};