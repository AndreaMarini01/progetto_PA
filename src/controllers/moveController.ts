import {NextFunction, Request, Response} from 'express';
import moveService from '../services/moveService';
import AuthFactory, {authErrorType} from "../factories/authFactory";
import MoveFactory, {moveErrorType} from "../factories/moveFactory";
import Game from "../models/Game";
import GameFactory, {gameErrorType} from "../factories/gameFactory";

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
            const result = await moveService.executeMove(gameId, from, to, playerId);
            res.status(200).json(result);
        } catch (err) {
            next(err)
        }
    }

    /**
     * Restituisce lo storico delle mosse di una data partita in formato JSON o PDF.
     *
     * @param req - L'oggetto della richiesta Express contenente l'ID della partita e il formato desiderato (json o pdf).
     * @param res - L'oggetto della risposta Express utilizzato per inviare il risultato al client.
     * @param next - La funzione di callback `NextFunction` per passare il controllo al middleware successivo in caso di errore.
     */

    public static async getMoveHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        const gameId = parseInt(req.params.gameId, 10);
        const format = req.query.format as string || 'json'; // Formato di default è JSON

        try {
            // Controllo sull'esistenza del gioco
            const gameExists = await Game.findByPk(gameId);
            if (!gameExists) {
                throw GameFactory.createError(gameErrorType.GAME_NOT_FOUND);
            }
            const result = await moveService.exportMoveHistory(gameId, format);

            if (format === 'pdf') {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=game_${gameId}_moves.pdf`);
                res.send(result);
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            next(error);
        }
    }

}

export default MoveController;

