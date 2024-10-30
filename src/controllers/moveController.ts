import {NextFunction, Request, Response} from 'express';
import moveService from '../services/moveService';
import AuthFactory, {authErrorType} from "../factories/authFactory";
import MoveFactory, {moveErrorType} from "../factories/moveFactory";
import Game from "../models/Game";
import GameFactory, {gameErrorType} from "../factories/gameFactory";

class MoveController {

    /**
     * Esegue una mossa in una partita specifica, utilizzando le coordinate di partenza e di destinazione fornite.
     *
     * @param req - L'oggetto `Request` di Express contenente:
     *   - `gameId` (number) - L'ID della partita in cui eseguire la mossa, fornito nel corpo della richiesta.
     *   - `from` (string) - La posizione di partenza della mossa, fornita nel corpo della richiesta.
     *   - `to` (string) - La posizione di destinazione della mossa, fornita nel corpo della richiesta.
     *   - `req.user.player_id` (number) - L'ID del giocatore che esegue la mossa, estratto dall'utente autenticato.
     * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
     *   - Risponde con il risultato della mossa eseguita in caso di successo.
     * @param next - La funzione `NextFunction` di Express utilizzata per gestire eventuali errori.
     *
     * @returns `Promise<void>` - Non restituisce un valore diretto, ma invia una risposta JSON contenente il risultato della mossa o passa l'errore al middleware di gestione degli errori.
     *
     * @throws {AuthError} - Genera un errore se:
     *   - `playerId` non è presente (es. l'utente non è autenticato).
     * @throws {MoveError} - Genera un errore se:
     *   - Uno o più parametri richiesti (`gameId`, `from`, `to`) sono assenti.
     *
     * Esempio di corpo della richiesta:
     * ```json
     * {
     *   "gameId": 1,
     *   "from": "D3",
     *   "to": "D4"
     * }
     * ```
     *
     * Esempio di risposta in caso di successo:
     * ```json
     * {
     *   "status": "success",
     *   "game_id": 1,
     *   "move": {
     *     "from": "D3",
     *     "to": "D4"
     *   },
     *   "board": [
     *     // ...array della configurazione della board aggiornata
     *   ]
     * }
     * ```
     */

    public static async executeMove(req: Request, res: Response, next: NextFunction) {
        const { gameId, from, to } = req.body;
        // Ottieni il playerId dall'utente autenticato
        const playerId = req.user?.player_id;
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
     * Recupera la cronologia delle mosse di una partita specifica in formato JSON o PDF.
     *
     * @param req - L'oggetto `Request` di Express contenente:
     *   - `gameId` (string) - L'ID della partita per la quale ottenere la cronologia delle mosse, passato come parametro URL.
     *   - `format` (string | opzionale) - Il formato della cronologia delle mosse, specificato nella query (può essere "json" o "pdf"). Il formato predefinito è "json".
     * @param res - L'oggetto `Response` di Express utilizzato per inviare la risposta al client.
     *   - Risponde con la cronologia delle mosse in formato JSON o come file PDF scaricabile.
     * @param next - La funzione `NextFunction` di Express utilizzata per gestire eventuali errori.
     *
     * @returns `Promise<void>` - Non restituisce un valore diretto, ma invia una risposta JSON o PDF con la cronologia delle mosse o passa l'errore al middleware di gestione degli errori.
     *
     * @throws {GameError} - Genera un errore se:
     *   - `gameId` non è valido o non corrisponde a nessuna partita (GAME_NOT_FOUND).
     *
     * Esempio di URL per la richiesta in formato JSON:
     * ```
     * GET /game/4/moves?format=json
     * ```
     *
     * Esempio di URL per la richiesta in formato PDF:
     * ```
     * GET /game/4/moves?format=pdf
     * ```
     *
     * Esempio di risposta in caso di successo (formato JSON):
     * ```json
     * {
     *   "game_id": 4,
     *   "moves": [
     *     { "move_number": 1, "from": "D3", "to": "D4" },
     *     { "move_number": 2, "from": "E6", "to": "E5" },
     *     ...
     *   ]
     * }
     * ```
     *
     * Esempio di risposta in caso di successo (formato PDF):
     * - La risposta sarà un file PDF scaricabile con la cronologia delle mosse.
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

