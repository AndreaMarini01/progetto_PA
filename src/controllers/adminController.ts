import {NextFunction, Request, Response} from 'express';
import Player from '../models/Player';
import TokenFactory, {tokenErrorType} from "../factories/tokenFactory";

/**
 * Ricarica i token di un giocatore utilizzando l'email fornita.
 *
 * Questa funzione gestisce la logica per aggiungere token al saldo di un giocatore specificato.
 * Verifica che l'email e il numero di token siano presenti nella richiesta. Se il giocatore viene
 * trovato e il numero di token è positivo, aggiorna il saldo dei token. Se mancano i parametri,
 * il giocatore non viene trovato o il numero di token non è positivo, genera un errore adeguato.
 *
 * @param req - L'oggetto della richiesta Express che contiene i dati della richiesta, inclusi `email` e `tokens` nel corpo.
 * @param res - L'oggetto della risposta Express utilizzato per inviare la risposta al client.
 * @param next - La funzione di callback `NextFunction` per passare il controllo al middleware successivo in caso di errore.
 *
 * @throws {TokenFactory.createError} - Lancia un errore se i parametri `email` o `tokens` sono mancanti,
 *                                      se il giocatore non è stato trovato o se i token non sono positivi.
 *
 * @returns Una risposta JSON con un messaggio di successo e il numero attuale di token del giocatore
 *          se l'operazione di aggiornamento è riuscita.
 */

export const chargeTokens = async (req: Request, res: Response, next: NextFunction) => {
    const { email, tokens } = req.body;
    try {
    // Controllo dei parametri richiesti
        if (!email || !tokens) {
            throw TokenFactory.createError(tokenErrorType.MISSING_PARAMETERS);
        }
        // Trova il giocatore in base all'email fornita
        const player = await Player.findOne({ where: { email } });
        if (!player) {
            throw TokenFactory.createError(tokenErrorType.USER_NOT_FOUND)
        }
        if (tokens > 0) {
            // Somma i nuovi token a quelli esistenti
            player.tokens += tokens;
            await player.save();
            res.status(200).json({message: 'Tokens have been updated!', currentTokens: player.tokens});
        } else {
            throw TokenFactory.createError(tokenErrorType.POSITIVE_TOKEN);
        }
    } catch (err) {
        next(err);
    }
};
