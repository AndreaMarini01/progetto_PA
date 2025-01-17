import { NextFunction, Request, Response } from 'express';
import Player from '../models/Player';
import TokenFactory, { tokenErrorType } from "../factories/TokenFactory";

/**
 * Classe AdminController per gestire le operazioni amministrative.
 *
 * Contiene metodi per operazioni come l'aggiornamento del saldo dei token per i giocatori.
 */

class AdminController {

    /**
     * Aggiorna il saldo dei token di un giocatore, aggiungendo un importo specificato.
     *
     * @param req - L'oggetto Request di Express contenente email e tokens nel corpo della richiesta.
     *   - email (string) - L'email del giocatore a cui aggiungere i token.
     *   - tokens (number) - L'importo dei token da impostare per l'utente. Deve essere un valore positivo e maggiore di quello attuale.
     * @param res - L'oggetto Response di Express usato per inviare la risposta al client.
     *   - Risponde con un messaggio di successo e il saldo aggiornato dei token se l'operazione va a buon fine.
     * @param next - La funzione NextFunction di Express utilizzata per gestire eventuali errori.
     *
     * @returns Promise<void> - Non restituisce un valore, ma invia una risposta JSON in caso di successo o passa l'errore al middleware di gestione degli errori.
     *
     * @throws {TokenError} - Genera un errore nei seguenti casi:
     *   - email o tokens non sono presenti nel corpo della richiesta.
     *   - Il giocatore con l'email specificata non viene trovato.
     *   - Il valore di tokens è negativo, uguale a zero o inferiore al credito attuale dell'utente.
     */

    public async chargeTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
        // Converte l'email presente nel corpo della richiesta in minuscolo
        if (req.body.email && typeof req.body.email === 'string') {
            req.body.email = req.body.email.toLowerCase();
        }
        // Inserisce nelle variabili i campi del corpo della richiesta
        const { email, tokens } = req.body;
        try {
            // Controllo dei parametri richiesti
            if (!email || !tokens) {
                throw TokenFactory.createError(tokenErrorType.MISSING_PARAMETERS);
            }
            // Trova il giocatore in base all'email fornita
            const player = await Player.findOne({ where: { email } });
            if (!player) {
                throw TokenFactory.createError(tokenErrorType.USER_NOT_FOUND);
            }
            if (tokens > 0 && tokens > player.tokens) {
                // Imposta i token dell'utente con il nuovo credito specificato
                player.tokens = tokens;
                await player.save();
                res.status(200).json({ message: 'Tokens have been updated!', currentTokens: player.tokens });
            } else {
                throw TokenFactory.createError(tokenErrorType.POSITIVE_TOKEN);
            }
        } catch (err) {
            next(err);
        }
    }
}

export default new AdminController();