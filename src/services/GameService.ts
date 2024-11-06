/**
 * Servizio `GameService` per gestire le operazioni relative alle partite,
 * tra cui creazione di partite, abbandono, ottenimento di certificati e gestione delle classifiche.
 *
 * @constant {number} GAME_CREATION_COST - Costo in token per la creazione di una partita.
 *
 * @method findActiveGameForPlayer
 * Cerca una partita attiva (stato `ONGOING`) per un giocatore specificato.
 * @param {number} playerId - ID del giocatore principale.
 * @param {number | null} opponentId - ID dell'avversario (se specificato).
 * @returns {Promise<Game | null>} - Restituisce la partita attiva o `null` se non trovata.
 *
 * @method createGame
 * Crea una nuova partita, detraendo il costo dai token del giocatore e inizializzando i dati di gioco.
 * @param {number} playerId - ID del giocatore principale.
 * @param {string | null} opponentEmail - Email dell'avversario, opzionale per partite PvE.
 * @param {GameType} type - Tipo di partita (`PVP` o `PVE`).
 * @param {AIDifficulty} aiDifficulty - Difficoltà dell'IA per le partite PvE, predefinito a `ABSENT`.
 * @param {any} board - Stato iniziale della board.
 * @param {number} total_moves - Numero totale di mosse iniziali.
 * @returns {Promise<Game>} - Restituisce la partita appena creata.
 *
 * @method abandonGame
 * Permette a un giocatore di abbandonare una partita e aggiorna il vincitore e lo stato della partita.
 * @param {number} gameId - ID della partita da abbandonare.
 * @param {number} playerId - ID del giocatore che abbandona.
 * @returns {Promise<Game>} - Restituisce la partita aggiornata.
 *
 * @method getCompletedGames
 * Recupera le partite concluse di un giocatore all'interno di un intervallo di date opzionale.
 * @param {number} playerId - ID del giocatore.
 * @param {string} startDate - Data di inizio, opzionale.
 * @param {string} endDate - Data di fine, opzionale.
 * @returns {Promise<{ message?: string, games: Game[], wins: number, losses: number }>} - Partite concluse con numero di vittorie e sconfitte.
 *
 * @method getPlayerLeaderboard
 * Recupera la classifica dei giocatori ordinata per punteggio.
 * @param {'asc' | 'desc'} order - Ordine di classifica, `asc` o `desc`.
 * @returns {Promise<Player[]>} - Elenco dei giocatori con il loro punteggio.
 *
 * @method generateVictoryCertificate
 * Genera un certificato di vittoria in formato PDF per un giocatore specificato.
 * @param {number} gameId - ID della partita vinta.
 * @param {number} playerId - ID del giocatore vincitore.
 * @returns {Promise<Buffer>} - Certificato di vittoria in formato `Buffer` PDF.
 */

import Game, {AIDifficulty, GameStatus, GameType} from '../models/Game';
import Player from '../models/Player';
import GameFactory, {gameErrorType} from '../factories/GameFactory';
import {Op} from 'sequelize';
import AuthFactory, {authErrorType} from "../factories/AuthFactory";
import PDFDocument from "pdfkit";
import moment from 'moment-timezone';

const GAME_CREATION_COST = 0.35;

class GameService {

    // Metodo per verificare che un utente non sia coinvolto in partite con status ongoing
    public async findActiveGameForPlayer(playerId: number, opponentId: number): Promise<Game | null> {
        // Crea una condizione per cui il valore di player_id corrisponde a playerId e il valore di opponent_id corrisponde a playerId
        const orConditions = [{ player_id: playerId }, { opponent_id: playerId }];
        // Condizione nel caso in cui l'opponent non sia l'IA
        if (opponentId !== -1) {
            // Aggiunge condizioni per cui il valore di player_id corrisponde a opponent_id e il valore di opponent_id corrisponde a opponent_id
            orConditions.push({ player_id: opponentId }, { opponent_id: opponentId });
        }
        return Game.findOne({
            // Verifica se esiste almeno un game con una delle condizioni soddisfatte
            where: {
                status: GameStatus.ONGOING,
                // Lega con il costrutto OR le precedenti condizioni
                [Op.or]: orConditions
            }
        });
    }

    public async createGame(playerId: number, opponentEmail: number, type: GameType, aiDifficulty: AIDifficulty = AIDifficulty.ABSENT, board: any, total_moves: number): Promise<Game> {
        // Cerca un player avente l'id passato alla funzione
        const player = await Player.findByPk(playerId);
        if (!player) {
            throw GameFactory.createError(gameErrorType.MISSING_PLAYER_ID);
        }
        if (player.tokens < GAME_CREATION_COST) {
            throw GameFactory.createError(gameErrorType.INSUFFICIENT_CREDIT);
        }
        player.tokens -= GAME_CREATION_COST;
        await player.save();
        // Imposta di deafult il valore di opponent_id a -1
        let opponentId: number = -1;
        // Se il game è di tipo PVP, cerca l'opponent sulla base dell'email fornita
        if (type === GameType.PVP) {
            if (!opponentEmail) {
                throw GameFactory.createError(gameErrorType.MISSING_GAME_PARAMETERS);
            }
            const opponent = await Player.findOne({ where: { email: opponentEmail } });
            if (!opponent) {
                throw GameFactory.createError(gameErrorType.OPPONENT_NOT_FOUND);
            }
            // Salva l'id dell'opponent
            opponentId = opponent.player_id;
        }
        // Crea un nuovo gioco
        const newGame = await Game.create({
            player_id: playerId,
            opponent_id: type === GameType.PVP ? opponentId : -1,
            status: GameStatus.ONGOING,
            type,
            ai_difficulty: type === GameType.PVE ? aiDifficulty : AIDifficulty.ABSENT,
            board,
            total_moves
        });
        return newGame;
    }

    public async abandonGame(gameId: number, playerId: number): Promise<Game> {
        // Trova il gioco sulla base dell'id
        const game = await Game.findByPk(gameId);
        if (!game) {
            throw GameFactory.createError(gameErrorType.GAME_NOT_FOUND);
        }
        // Se il player che effettua la richiesta non è coinvolto nella partita, lancia un errore
        if (game.player_id !== playerId && game.opponent_id !== playerId) {
            throw AuthFactory.createError(authErrorType.UNAUTHORIZED);
        }
        // Se il gioco non è in corso, restituisce un errore
        if (game.status !== GameStatus.ONGOING) {
            throw GameFactory.createError(gameErrorType.GAME_NOT_IN_PROGRESS);
        }
        // Cambia lo stato della partita in "Abandoned"
        game.status = GameStatus.ABANDONED;
        // Modifica il campo 'ended_at'
        game.ended_at = new Date();
        // Se la partita è PVE
        if (game.type === GameType.PVE) {
            // Se è una partita PvE, l'IA vince se il giocatore abbandona
            game.winner_id = -1;
        } else {
            // Se è una partita PvP, l'avversario vince
            game.winner_id = (game.player_id === playerId) ? (game.opponent_id ?? -1) : (game.player_id ?? null);
        }
        await game.save();
        // Decrementa il punteggio del giocatore che ha abbandonato
        const player = await Player.findByPk(playerId);
        if (player) {
            player.score -= 0.5;
            await player.save();
        }
        // Incrementa il punteggio del giocatore vincitore
        if (game.winner_id) {
            const winner = await Player.findByPk(game.winner_id);
            if (winner) {
                winner.score += 1;
                await winner.save();
            }
        }
        return game;
    }

    public async getCompletedGames(playerId: number, startDate?: string, endDate?: string): Promise<{ message?: string, games: Game[], wins: number, losses: number }> {
        // Se uno dei due parametri non è specificato, lancia un'eccezione
        if ((startDate && !endDate) || (!startDate && endDate)) {
            throw GameFactory.createError(gameErrorType.MISSING_DATE);
        }
        // Formattazione ISO delle date
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(Z|[+-]\d{2}:\d{2}))?$/;
        // Lancia un errore nel caso in cui le date abbiano una formattazione errata
        if (startDate && !isoDateRegex.test(startDate)) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE);
        }
        if (endDate && !isoDateRegex.test(endDate)) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE);
        }
        // Validazione delle date
        const parsedStartDate = startDate ? new Date(startDate) : null;
        const parsedEndDate = endDate ? new Date(endDate) : null;
        // isNaN verifica se il risultato è NaN. Se è vero, significa che startDate (o endDate) non è una data valida, quindi viene lanciato un errore
        if (startDate && parsedStartDate && isNaN(parsedStartDate.getTime())) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE);
        }
        if (endDate && parsedEndDate && isNaN(parsedEndDate.getTime())) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE);
        }
        // Verifica che startDate sia minore o uguale a endDate
        if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE_RANGE);
        }
        // Aggiungi un giorno alla fine per includere tutte le partite fino alla fine di endDate
        const nextDay = parsedEndDate ? new Date(parsedEndDate) : null;
        if (nextDay) {
            nextDay.setDate(nextDay.getDate() + 1);
        }
        // Costruzione della query di ricerca
        const whereClause: any = {
            // Questo operatore indica che il valore del campo status deve essere contenuto in un insieme specifico di valori
            status: { [Op.in]: [GameStatus.COMPLETED, GameStatus.ABANDONED, GameStatus.TIMED_OUT] },
            // Questo operatore indica che almeno una delle condizioni all'interno dell'array deve essere vera
            [Op.or]: [
                { player_id: playerId },
                { opponent_id: playerId }
            ]
        };
        // Data compresa tra la dati di inizio e quella di fine
        if (parsedStartDate) {
            // L'operatore verifica che ended_at sia maggiore o uguale a parsedStartDate (greater than equal)
            whereClause.ended_at = { [Op.gte]: parsedStartDate };
        }
        // Se nextDay è presente, aggiunge un ulteriore controllo su ended_at, utilizzando l'operatore [Op.lt] (Less Than), che filtra per date inferiori a nextDay.
        if (nextDay) {
            whereClause.ended_at = whereClause.ended_at
                ? { ...whereClause.ended_at, [Op.lt]: nextDay }
                : { [Op.lt]: nextDay };
        }
        // Esecuzione della query
        const games = await Game.findAll({ where: whereClause });
        if (games.length === 0) {
            return {
                message: "No matches found for the specified date range.",
                games: [],
                wins: 0,
                losses: 0
            };
        }
        // Calcolo dei risultati
        let wins = 0;
        let losses = 0;
        // Elimina il campo "board" direttamente dalle istanze di Game
        for (const game of games) {
            delete game.dataValues.board;
            let outcome = "Lost"
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
            // Aggiunge il campo outcome per indicare la vittoria o la sconfitta della partita
            (game as any).dataValues.outcome = outcome;
        }
        return { games, wins, losses };
    }

    public async getPlayerLeaderboard(order: 'asc' | 'desc'): Promise<Player[]> {
        // Recupera i giocatori ordinati per punteggio
        const players = await Player.findAll({
            order: [['score', order]],
            // Specifica i campi da restituire
            attributes: ['username', 'score'],
        });
        return players;
    }

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
        // Tempo in minuti
        const timeTakenMinutes = Math.floor(timeTaken / (1000 * 60));
        // Ottiene il numero totale di mosse
        const totalMoves = game.total_moves;
        let winnerName = "Sconosciuto";
        let opponentName = "Sconosciuto";
        // Recupera il nome del vincitore usando `game.winner_id`
        if (game.winner_id === playerId) {
            // Il chiamante è il vincitore
            const winner = await Player.findOne({where: {player_id: game.winner_id}});
            if (winner) {
                winnerName = winner.username;
            }
            // Imposta opponentName in base a opponent_id
            if (game.opponent_id === -1) {
                opponentName = "AI";
            } else if (game.opponent_id !== -1) {
                const opponent = await Player.findOne({where: {player_id: game.opponent_id}});
                if (opponent) {
                    opponentName = opponent.username;
                }
            }
        }
        // Se il vincitore è l'opponent
        if (game.opponent_id === playerId) {
                const winner = await Player.findOne({where: { player_id: game.opponent_id}});
            if (winner) {
                winnerName = winner.username;
            }
            if (game.player_id === -1) {
                opponentName = "AI";
            } else if (game.player_id !== -1) {
                const opponent= await Player.findOne({where:{ player_id: game.player_id }});
                if (opponent) {
                    opponentName = opponent.username
                }
            }
        }
        // Formatta la data nel formato desiderato
        const formattedStartDate = game.created_at
            ? moment(game.created_at).tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss')
            : "Data non disponibile";
        // Formatta la data nel formato desiderato
        const formattedEndDate = game.ended_at
            ? moment(game.ended_at).tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss')
            : "Data non disponibile";
        // Genera il PDF
        const doc = new PDFDocument();
        let buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            return Buffer.concat(buffers);
        });
        doc.fontSize(26).fillColor('#4B0082').text('Winner Certificate', { align: 'center' });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#4B0082');
        doc.moveDown(2);
        doc.fontSize(18).fillColor('black').text('Game Details', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(14).text(`Game Starting Date: `, { continued: true }).fillColor('#333').text(formattedStartDate);
        doc.fontSize(14).fillColor('black').text(`Game Ending Date: `, { continued: true }).fillColor('#333').text(formattedEndDate);
        doc.fontSize(14).fillColor('black').text(`Duration: `, { continued: true }).fillColor('#333').text(`${timeTakenMinutes} minutes`);
        doc.fontSize(14).fillColor('black').text(`Total Moves: `, { continued: true }).fillColor('#333').text(totalMoves.toString());
        doc.moveDown(2);
        doc.fontSize(18).fillColor('black').text('Player Details', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(14).fillColor('black').text(`Winner Name: `, { continued: true }).fillColor('#008000').text(winnerName);
        doc.fontSize(14).fillColor('black').text(`Opponent Name: `, { continued: true }).fillColor('#FF4500').text(opponentName);
        doc.moveDown(2);
        doc.fontSize(20).fillColor('#4B0082').text('Congratulations on Your Victory!', { align: 'center' });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#4B0082');
        doc.moveDown(2);
        doc.fontSize(14).fillColor('#333').text('This certificate is automatically generated by the game system.', { align: 'center' });
        doc.moveDown();
        doc.text('Game System Signature', { align: 'center' });
        doc.end();
        await new Promise((resolve) => doc.on('end', resolve));
        return Buffer.concat(buffers);
    }
}

export default new GameService();
