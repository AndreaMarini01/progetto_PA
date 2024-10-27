import {NextFunction, Request, Response} from 'express';
import MoveService from '../services/moveService';
import AuthFactory, {authErrorType} from "../factories/authFactory";
import MoveFactory, {moveErrorType} from "../factories/moveFactory";

class MoveController {

    /**
     * Esegue una mossa in una partita, validando i parametri e l'autenticazione dell'utente.
     *
     * Questo metodo gestisce la richiesta di eseguire una mossa in un gioco specificato. Verifica che
     * l'utente sia autenticato e che tutti i parametri richiesti siano presenti. In caso di successo,
     * invia i dati al servizio per eseguire la mossa e restituisce il risultato. In caso di errore,
     * passa l'errore al middleware di gestione degli errori.
     *
     * @param req - L'oggetto della richiesta Express che contiene `gameId`, `from`, e `to` nel corpo della richiesta.
     * @param res - L'oggetto della risposta Express utilizzato per inviare il risultato della mossa al client.
     * @param next - La funzione di callback `NextFunction` per passare il controllo al middleware successivo in caso di errore.
     *
     * @throws {AuthFactory.createError} - Lancia un errore se l'utente non è autenticato.
     * @throws {MoveFactory.createError} - Lancia un errore se mancano parametri richiesti.
     *
     * @returns Una risposta JSON contenente il risultato dell'esecuzione della mossa se l'operazione ha successo.
     */

    public static async executeMove(req: Request, res: Response, next: NextFunction) {
        const { gameId, from, to } = req.body;
        // Ottieni il playerId dall'utente autenticato
        const playerId = req.user?.id_player;
        try {
        if (!playerId) {
            throw AuthFactory.createError(authErrorType.NEED_AUTHORIZATION);
        }
        if (!gameId || !from || !to) {
            //return res.status(400).json({ message: 'Missing required parameters' });
            throw MoveFactory.createError(moveErrorType.MISSING_PARAMS);
        }
            // Passa i parametri al servizio per eseguire la mossa
            const result = await MoveService.executeMove(gameId, from, to, playerId);
            res.status(200).json(result);
        } catch (err) {
            next(err)
        }
    }
}

export default MoveController;

