import Game, {AIDifficulty, GameStatus, GameType} from '../models/Game';
import Player from '../models/Player';
import GameFactory, {gameErrorType} from '../factories/gameFactory';
import {Op} from 'sequelize';
import AuthFactory, {authErrorType} from "../factories/authFactory";
import Move from "../models/Move";
import PDFDocument from "pdfkit";

const GAME_CREATION_COST = 0.35;

/**
 * Classe `GameService` che gestisce la logica di business legata alle partite.
 *
 * Contiene metodi per trovare partite attive, creare nuove partite e gestire l'abbandono delle partite.
 */
class gameService {
    /**
     * Trova una partita attiva per un giocatore.
     *
     * Cerca una partita con stato "Ongoing" in cui il giocatore specificato sia coinvolto.
     * Se viene fornito un `opponentId`, verifica anche se l'avversario specificato è nella partita.
     *
     * @param {number} playerId - L'ID del giocatore.
     * @param {number | null} opponentId - L'ID dell'avversario (opzionale).
     * @returns {Promise<Game | null>} Una promessa che restituisce la partita trovata o `null` se non esiste.
     */
    public async findActiveGameForPlayer(playerId: number, opponentId: number | null): Promise<Game | null> {
        return Game.findOne({
            where: {
                status: GameStatus.ONGOING,
                [Op.or]: [
                    { player_id: playerId },
                    { opponent_id: playerId },
                    ...(opponentId !== null ? [{ player_id: opponentId }, { opponent_id: opponentId }] : [])
                ]
            }
        });
    }

    /**
     * Crea una nuova partita.
     *
     * Questa funzione crea una partita con i parametri specificati e deduce il costo di creazione
     * dal saldo del giocatore. Supporta sia modalità PvP che PvE, e verifica che il giocatore
     * abbia credito sufficiente per creare la partita.
     *
     * @param {number} playerId - L'ID del giocatore che crea la partita.
     * @param {number | null} opponentEmail - L'email dell'avversario, se la partita è PvP.
     * @param {GameType} type - Il tipo di partita (PvP o PvE).
     * @param {AIDifficulty} [aiDifficulty=AIDifficulty.ABSENT] - Il livello di difficoltà dell'IA, se applicabile.
     * @param {any} board - La configurazione iniziale della tavola di gioco.
     * @param {number} total_moves - Il numero totale di mosse iniziali (tipicamente 0 per una nuova partita).
     * @returns {Promise<Game>} Una promessa che restituisce la nuova partita creata.
     *
     * @throws {GameError} - Lancia un errore se il giocatore non esiste, non ha credito sufficiente,
     * o se i parametri della partita sono incompleti.
     */
    public async createGame(
        playerId: number,
        opponentEmail: number | null,
        type: GameType,
        aiDifficulty: AIDifficulty = AIDifficulty.ABSENT,
        board: any,
        total_moves: number,
    ): Promise<Game> {
        const player = await Player.findByPk(playerId);
        if (!player) {
            throw GameFactory.createError(gameErrorType.MISSING_PLAYER_ID);
        }

        if (player.tokens < GAME_CREATION_COST) {
            throw GameFactory.createError(gameErrorType.INSUFFICIENT_CREDIT);
        }

        player.tokens -= GAME_CREATION_COST;
        await player.save();

        let opponentId: number | null = null;
        if (type === GameType.PVP) {
            if (!opponentEmail) {
                throw GameFactory.createError(gameErrorType.MISSING_GAME_PARAMETERS);
            }
            const opponent = await Player.findOne({ where: { email: opponentEmail } });
            if (!opponent) {
                throw GameFactory.createError(gameErrorType.OPPONENT_NOT_FOUND);
            }
            opponentId = opponent.id_player;
        }

        const newGame = await Game.create({
            player_id: playerId,
            opponent_id: type === GameType.PVP ? opponentId : null,
            status: GameStatus.ONGOING,
            type,
            ai_difficulty: type === GameType.PVE ? aiDifficulty : AIDifficulty.ABSENT,
            date: new Date(),
            board,
            total_moves
        });

        return newGame;
    }

    /**
     * Gestisce l'abbandono di una partita.
     *
     * @param {number} gameId - L'ID della partita da abbandonare.
     * @param {number} playerId - L'ID del giocatore che vuole abbandonare la partita.
     * @returns {Promise<Game>} Una promessa che restituisce la partita aggiornata.
     *
     * @throws {AuthError} - Lancia un errore se l'utente non è autorizzato ad abbandonare la partita.
     * @throws {GameError} - Lancia un errore se la partita non esiste o non è in corso.
     */

    public async abandonGame(gameId: number, playerId: number): Promise<Game> {
        const game = await Game.findByPk(gameId);
        if (!game) {
            throw GameFactory.createError(gameErrorType.INVALID_GAME_PARAMETERS);
        }

        if (game.player_id !== playerId && game.opponent_id !== playerId) {
            throw AuthFactory.createError(authErrorType.UNAUTHORIZED);
        }

        if (game.status !== GameStatus.ONGOING) {
            throw GameFactory.createError(gameErrorType.GAME_NOT_IN_PROGRESS);
        }

        // Cambia lo stato della partita in "Abandoned"
        game.status = GameStatus.ABANDONED;
        game.ended_at = new Date();
        await game.save();

        if (game.type === GameType.PVE) {
            // Se è una partita PvE, l'IA vince se il giocatore abbandona
            game.winner_id = -1;
        } else {
            // Se è una partita PvP, l'avversario vince
            game.winner_id = (game.player_id === playerId) ? game.opponent_id ?? null : game.player_id ?? null;
        }

        // Decrementa il punteggio del giocatore che ha abbandonato
        const player = await Player.findByPk(playerId);
        if (player) {
            player.score -= 0.5;
            await player.save();
        }

        return game;
    }

    public async getCompletedGames(
        playerId: number,
        startDate?: string,
        endDate?: string
    ): Promise<{ message?: string, games: Game[], wins: number, losses: number }> {
        if ((startDate && !endDate) || (!startDate && endDate)) {
            throw GameFactory.createError(gameErrorType.MISSING_DATE);
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (startDate && !dateRegex.test(startDate)) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE); // Errore per formato data non valido
        }
        if (endDate && !dateRegex.test(endDate)) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE); // Errore per formato data non valido
        }

        // Validazione delle date
        const parsedStartDate = startDate ? new Date(startDate) : null;
        const parsedEndDate = endDate ? new Date(endDate) : null;
        if (startDate && parsedStartDate && isNaN(parsedStartDate.getTime())) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE);
        }

        if (endDate && parsedEndDate && isNaN(parsedEndDate.getTime())) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE);
        }

        // Verifica che startDate sia minore o uguale a endDate
        if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE_RANGE); // Errore per intervallo di date non valido
        }

        // Aggiungi un giorno alla fine per includere tutte le partite fino alla fine di endDate
        const nextDay = parsedEndDate ? new Date(parsedEndDate) : null;
        if (nextDay) {
            nextDay.setDate(nextDay.getDate() + 1);
        }

        // Costruzione della query di ricerca
        const whereClause: any = {
            status: { [Op.in]: [GameStatus.COMPLETED, GameStatus.ABANDONED, GameStatus.TIMED_OUT] },
            [Op.or]: [
                { player_id: playerId },
                { opponent_id: playerId }
            ]
        };

        // Data compresa tra la dati di inizio e quella di fine
        if (parsedStartDate) {
            whereClause.ended_at = { [Op.gte]: parsedStartDate };
        }
        if (nextDay) {
            whereClause.ended_at = whereClause.ended_at
                ? { ...whereClause.ended_at, [Op.lt]: nextDay }
                : { [Op.lt]: nextDay };
        }

        // Esecuzione della query
        const games = await Game.findAll({ where: whereClause });

        if (games.length === 0) {
            return {
                message: "Nessuna partita trovata per l'intervallo di date specificato.",
                games: [],
                wins: 0,
                losses: 0
            };
        }

        // Calcolo dei risultati
        let wins = 0;
        let losses = 0;
        let totalMoves = 0;

        // Elimina il campo "board" direttamente dalle istanze di Game
        for (const game of games) {
            delete game.dataValues.board; // Rimuovi il campo "board"

            let outcome = "Lost" // Valore di default

            if (game.winner_id === playerId) {
                // Il giocatore ha vinto
                wins++;
                outcome = "Won";
            } else if (game.winner_id === -1 && game.type === GameType.PVE) {
                // L'IA ha vinto in una partita PvE
                losses++;
            } else if (game.opponent_id === playerId || game.player_id === playerId) {
                // Controllo per le sconfitte nelle partite PvP
                losses++;
            }
            // totalMoves += game.total_moves;
            (game as any).dataValues.outcome = outcome;
        }

        //return { games, totalMoves, wins, losses };
        return { games, wins, losses };
    }

    /**
     * Ottiene la classifica dei giocatori ordinata per punteggio (score).
     *
     * @param {string} order - Specifica l'ordinamento, "asc" per ascendente, "desc" per discendente.
     * @returns {Promise<Player[]>} Una promessa che restituisce un array di giocatori ordinati.
     */

    public async getPlayerLeaderboard(order: 'asc' | 'desc'): Promise<Player[]> {
        // Recupera i giocatori ordinati per punteggio
        const players = await Player.findAll({
            order: [['score', order]], // Ordina in base al punteggio (score)
            attributes: ['username', 'score'], // Specifica i campi da restituire
        });

        return players;
    }

    /**
     * Genera un certificato di vittoria in formato PDF per una partita specifica.
     *
     * @param gameId - L'ID della partita per la quale generare il certificato.
     * @param playerId
     * @returns Una promessa che restituisce un buffer contenente il PDF del certificato.
     *
     * @throws {Error} - Lancia un errore se la partita non viene trovata o se non è stata vinta.
     */
    public async generateVictoryCertificate(gameId: number, playerId: number): Promise<Buffer> {
        const game = await Game.findByPk(gameId);

        if (!game) {
            throw GameFactory.createError(gameErrorType.GAME_NOT_FOUND);
        }

        if (game.winner_id !== playerId) {
            throw GameFactory.createError(gameErrorType.ONLY_WINNER);
        }

        if (game.status === GameStatus.ONGOING) {
            throw GameFactory.createError(gameErrorType.GAME_IN_PROGRESS);
        }

        // Calcola il tempo impiegato per vincere
        const endedAt = game.ended_at ? new Date(game.ended_at).getTime() : 0;
        const createdAt = game.created_at ? new Date(game.created_at).getTime() : 0;
        const timeTaken = endedAt - createdAt;
        const timeTakenMinutes = Math.floor(timeTaken / (1000 * 60)); // Tempo in minuti


        // Conta il numero totale di mosse
        const totalMoves = game.total_moves;

        let winnerName = "Sconosciuto";
        if (game.winner_id) {
            const winner = await Player.findOne({ where: { id_player: game.winner_id } });
            if (winner) {
                winnerName = winner.username;
            }
        }

        // Ottieni il nome dell'avversario
        let opponentName = "AI";
        if (game.opponent_id) {
            const opponent = await Player.findOne({ where: { id_player: game.opponent_id } });
            if (opponent) {
                opponentName = opponent.username;
            }
        }

        const formattedStartDate = game.created_at ? new Date(game.created_at).toDateString() + ' ' + new Date(game.created_at).toTimeString().split(' ')[0] : "Data non disponibile";
        const formattedEndDate = game.ended_at ? new Date(game.ended_at).toDateString() + ' ' + new Date(game.ended_at).toTimeString().split(' ')[0] : "Data non disponibile";


        // Genera il PDF
        const doc = new PDFDocument();
        let buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            return Buffer.concat(buffers);
        });

        doc.fontSize(26).fillColor('#4B0082').text('Winner Certificate', { align: 'center' });
        doc.moveDown();

// Separator line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#4B0082');
        doc.moveDown(2);

// Game Details
        doc.fontSize(18).fillColor('black').text('Game Details', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(14).text(`Game Starting Date: `, { continued: true }).fillColor('#333').text(formattedStartDate);
        doc.fontSize(14).fillColor('black').text(`Game Ending Date: `, { continued: true }).fillColor('#333').text(formattedEndDate);
        doc.fontSize(14).fillColor('black').text(`Duration: `, { continued: true }).fillColor('#333').text(`${timeTakenMinutes} minutes`);
        doc.fontSize(14).fillColor('black').text(`Total Moves: `, { continued: true }).fillColor('#333').text(totalMoves.toString());
        doc.moveDown(2);

// Player Details
        doc.fontSize(18).fillColor('black').text('Player Details', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(14).fillColor('black').text(`Winner Name: `, { continued: true }).fillColor('#008000').text(winnerName);
        doc.fontSize(14).fillColor('black').text(`Opponent Name: `, { continued: true }).fillColor('#FF4500').text(opponentName);
        doc.moveDown(2);

// Congratulations message
        doc.fontSize(20).fillColor('#4B0082').text('Congratulations on Your Victory!', { align: 'center' });
        doc.moveDown();

// Bottom separator line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#4B0082');
        doc.moveDown(2);

// Signature
        doc.fontSize(14).fillColor('#333').text('This certificate is automatically generated by the game system.', { align: 'center' });
        doc.moveDown();
        doc.text('Game System Signature', { align: 'center' });
        doc.end();


        await new Promise((resolve) => doc.on('end', resolve));
        return Buffer.concat(buffers);
    }


}

export default new gameService();
