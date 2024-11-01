/**
 * Servizio `gameService` per gestire le operazioni relative alle partite,
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
 * @param {number | null} opponentEmail - Email dell'avversario, opzionale per partite PvE.
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
import GameFactory, {gameErrorType} from '../factories/gameFactory';
import {Op} from 'sequelize';
import AuthFactory, {authErrorType} from "../factories/authFactory";
import PDFDocument from "pdfkit";
import moment from 'moment-timezone';

const GAME_CREATION_COST = 0.35;

class gameService {

    public async findActiveGameForPlayer(playerId: number, opponentId: number): Promise<Game | null> {
        const orConditions = [{ player_id: playerId }, { opponent_id: playerId }];

        if (opponentId !== -1) {
            orConditions.push({ player_id: opponentId }, { opponent_id: opponentId });
        }

        return Game.findOne({
            where: {
                status: GameStatus.ONGOING,
                [Op.or]: orConditions
            }
        });
    }

    public async createGame(
        playerId: number,
        opponentEmail: number,
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
        let opponentId: number = -1;
        if (type === GameType.PVP) {
            if (!opponentEmail) {
                throw GameFactory.createError(gameErrorType.MISSING_GAME_PARAMETERS);
            }
            const opponent = await Player.findOne({ where: { email: opponentEmail } });
            if (!opponent) {
                throw GameFactory.createError(gameErrorType.OPPONENT_NOT_FOUND);
            }
            opponentId = opponent.player_id;
        }
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
        const game = await Game.findByPk(gameId);
        if (!game) {
            throw GameFactory.createError(gameErrorType.GAME_NOT_FOUND);
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
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(Z|[+-]\d{2}:\d{2}))?$/;
        if (startDate && !isoDateRegex.test(startDate)) {
            throw GameFactory.createError(gameErrorType.INVALID_DATE); // Errore per formato data non valido
        }
        if (endDate && !isoDateRegex.test(endDate)) {
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
            (game as any).dataValues.outcome = outcome;
        }
        return { games, wins, losses };
    }

    public async getPlayerLeaderboard(order: 'asc' | 'desc'): Promise<Player[]> {
        // Recupera i giocatori ordinati per punteggio
        const players = await Player.findAll({
            order: [['score', order]], // Ordina in base al punteggio (score)
            attributes: ['username', 'score'], // Specifica i campi da restituire
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
        const timeTakenMinutes = Math.floor(timeTaken / (1000 * 60)); // Tempo in minuti
        // Conta il numero totale di mosse
        const totalMoves = game.total_moves;

        // Imposta il nome del vincitore come l'utente loggato (playerId) di default
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
        const formattedStartDate = game.created_at
            ? moment(game.created_at).tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss')
            : "Data non disponibile";

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
