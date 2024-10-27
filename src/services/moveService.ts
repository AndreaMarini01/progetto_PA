import Game, {AIDifficulty, GameStatus, GameType} from '../models/Game';
import Player from '../models/Player';
import Move from "../models/Move";
import {DraughtsMove1D, DraughtsSquare1D, DraughtsStatus} from 'rapid-draughts';
import { EnglishDraughtsComputerFactory as ComputerFactory } from 'rapid-draughts/english';
import {EnglishDraughts as Draughts} from 'rapid-draughts/english';
import MoveFactory, {moveErrorType} from "../factories/moveFactory";
import AuthFactory, {authErrorType} from "../factories/authFactory";
import GameFactory, {gameErrorType} from "../factories/gameFactory";
import {NextFunction} from "express";
import * as jsPDF from "jspdf";
import PDFDocument from 'pdfkit';


const TIMEOUT_MINUTES = 1;
const MOVE_COST = 0.02;


/**
 * Servizio per la gestione delle mosse in una partita.
 *
 * La classe `MoveService` fornisce metodi per l'esecuzione delle mosse,
 * la gestione del gioco dell'IA e la verifica dello stato della partita.
 * Gestisce le regole delle mosse, il salvataggio delle mosse nel database e
 * la verifica delle condizioni di vittoria o pareggio.
 */

class moveService {

    /**
     * Sceglie una mossa per l'IA in base alla difficoltà specificata.
     *
     * Se la difficoltà è EASY, viene utilizzato un algoritmo casuale.
     * Se la difficoltà è HARD, viene utilizzato l'algoritmo AlphaBeta con profondità massima pari a 5.
     *
     * @param draughts - L'istanza di `Draughts` per gestire la logica del gioco.
     * @param difficulty - Il livello di difficoltà dell'IA.
     * @returns {Promise<DraughtsMove1D | null>} La mossa scelta dall'IA o `null` se non ci sono mosse disponibili.
     */

    private static async chooseAIMove(draughts: any, difficulty: AIDifficulty): Promise<DraughtsMove1D | null> {
        const validMoves = draughts.moves;
        if (validMoves.length === 0) return null;

        switch (difficulty) {
            case AIDifficulty.EASY:
                // Se la difficoltà è EASY, usa il computer casuale
                const randomComputer = ComputerFactory.random();
                return await randomComputer(draughts);
            case AIDifficulty.HARD:
                // Se la difficoltà è HARD, usa il computer AlphaBeta con maxDepth pari a 5
                const alphaBetaComputer = ComputerFactory.alphaBeta({ maxDepth: 5 });
                return await alphaBetaComputer(draughts);
            default:
                // Difficoltà ASSENTE, l'IA non deve fare mosse
                return null;
        }
    }

    /**
     * Converte una posizione della scacchiera espressa come stringa (ad esempio, "A7")
     * in un numero intero corrispondente alla posizione unidimensionale.
     *
     * @param position - La posizione della scacchiera in formato stringa.
     * @returns {number} La posizione convertita in formato numerico.
     */

    public static convertPosition(position: string): number {
        const file = position.charCodeAt(0) - 'A'.charCodeAt(0);
        const rank = 8 - parseInt(position[1]);
        return rank * 8 + file;
    }

    /**
     * Converte una posizione unidimensionale in una rappresentazione della scacchiera (ad esempio, "A7").
     *
     * @param index - La posizione numerica unidimensionale.
     * @returns {string} La posizione convertita in formato stringa.
     */

    public static convertPositionBack(index: number): string {
        const file = String.fromCharCode('A'.charCodeAt(0) + (index % 8));
        const rank = 8 - Math.floor(index / 8);
        return `${file}${rank}`;
    }

    /**
     * Esegue una mossa per il giocatore in una partita.
     *
     * Questo metodo gestisce la logica per eseguire una mossa, verificare la sua validità,
     * aggiornare lo stato della partita e, se necessario, eseguire la mossa dell'IA per le partite PvE.
     *
     * @param {number} gameId - L'ID della partita.
     * @param {string} from - La posizione iniziale della mossa.
     * @param {string} to - La posizione finale della mossa.
     * @param {number} playerId - L'ID del giocatore che esegue la mossa.
     * @returns {Promise<object>} Un oggetto che rappresenta il risultato della mossa.
     *
     * @throws {MoveError} - Lancia un errore se la partita o il giocatore non sono trovati,
     * se la mossa non è valida o se ci sono errori nel parsing della scacchiera.
     */

    public static async executeMove(gameId: number, from: string, to: string, playerId: number) {
        console.log('Eseguendo la mossa:', { gameId, from, to, playerId });

        const player = await Player.findByPk(playerId);
        if (!player) {
            console.log('Giocatore non trovato:', playerId);
            throw new Error("Player not found.");
        }

        const game = await Game.findByPk(gameId);
        if (!game) {
            throw MoveFactory.createError(moveErrorType.GAME_NOT_FOUND);
        }

        // Lancia un errore nel caso in cui la partita non sia in corso
        if (game.status !== GameStatus.ONGOING) {
            throw GameFactory.createError(gameErrorType.GAME_NOT_IN_PROGRESS);
        }

        // Se il giocatore che esegue la mossa non è uno dei due giocatori coinvolti, restituisce un errore
        if (game.player_id !== playerId && game.opponent_id !== playerId) {
            throw AuthFactory.createError(authErrorType.UNAUTHORIZED);
        }

        player.tokens -= MOVE_COST;
        await player.save();

        // Carica la board salvata nel database
        let savedData: { board: DraughtsSquare1D[] } | null = null;

        // Converte la board in JSON
        try {
            console.log('Parsing board:', game.board);
            savedData = typeof game.board === 'string' ? JSON.parse(game.board) : game.board;
        } catch (error) {
            throw MoveFactory.createError(moveErrorType.FAILED_PARSING);
        }

        // Verifica che la board esista e che sia di tipo JSON
        const savedBoard = savedData?.board;
        if (!savedBoard || !Array.isArray(savedBoard)) {
            throw MoveFactory.createError(moveErrorType.NOT_VALID_ARRAY);
        }

        const flattenedBoard = savedBoard.flat();

        // Inizializza il gioco utilizzando la board salvata in precedenza
        const draughts = Draughts.setup();
        flattenedBoard.forEach((square, index) => {
            draughts.board[index] = square;
        });

        console.log("Mosse possibili dalla configurazione data:");
        draughts.moves.forEach(move => {
            const moveFrom = moveService.convertPositionBack(move.origin);
            const moveTo = moveService.convertPositionBack(move.destination);
            console.log(`Mossa: da ${moveFrom} a ${moveTo}`);
        });

        const origin = moveService.convertPosition(from);
        const destination = moveService.convertPosition(to);

        // Verifica che una mossa sia valida
        const validMoves = draughts.moves;
        const moveToMake = validMoves.find(move => move.origin === origin && move.destination === destination);
        if (!moveToMake) {
            throw MoveFactory.createError(moveErrorType.NOT_VALID_MOVE);
        }

        // Controlla se la mossa corrente è uguale all'ultima mossa effettuata
        const lastMove = await Move.findOne({
            where: { game_id: gameId },
            order: [['createdAt', 'DESC']]
        });

        if (lastMove) {
            const lastMoveTime = new Date(lastMove.createdAt);
            const currentTime = new Date();
            const timeDifference = (currentTime.getTime() - lastMoveTime.getTime()) / (1000 * 60); // Differenza in minuti

            if (timeDifference > TIMEOUT_MINUTES) {
                // Imposta lo stato della partita come persa per "timeout"
                game.status = GameStatus.TIMED_OUT;
                game.ended_at = currentTime;
                await game.save();

                // Decrementa il punteggio del giocatore di 0.5 punti
                const player = await Player.findByPk(playerId);
                if (player) {
                    player.score -= 0.5;
                    await player.save();
                }

                return {
                    message: `The game has ended due to a timeout after ${TIMEOUT_MINUTES} minutes.`,
                    game_id: gameId,
                    status: game.status,
                };
            }
        }

        if (lastMove && lastMove.fromPosition === from && lastMove.toPosition === to) {
            throw MoveFactory.createError(moveErrorType.NOT_VALID_MOVE);
        }

        // Esegui la mossa del giocatore
        draughts.move(moveToMake);

        // Aggiorna la board e salva la mossa del giocatore
        game.board = JSON.stringify({ board: draughts.board });
        game.total_moves = (game.total_moves || 0) + 1;
        await game.save();

        const moveNumber = game.total_moves;

        // Salva la mossa nel database
        await Move.create({
            moveNumber: moveNumber,
            board: { board: draughts.board },
            fromPosition: from,
            toPosition: to,
            pieceType: savedBoard[origin]?.piece?.king ? 'king' : 'single',
            game_id: gameId,
            user_id: playerId,
            details: {},
        });

        // Verifica se la mossa del giocatore ha concluso il gioco
        if ([DraughtsStatus.LIGHT_WON, DraughtsStatus.DARK_WON, DraughtsStatus.DRAW].includes(draughts.status as DraughtsStatus)) {
            const gameOverResult = await moveService.handleGameOver(draughts, game);
            game.status = GameStatus.COMPLETED;
            game.ended_at = new Date();
            await game.save();
            return {
                message: gameOverResult.message,
                game_id: gameId,
                board: gameOverResult.board,
                moveDescription: `The game has ended: ${gameOverResult.message}`,
            };
        }

        // Se la partita è PvE, esegui anche la mossa dell'IA
        if (game.type === GameType.PVE) {
            const aiMove = await moveService.chooseAIMove(draughts, game.ai_difficulty);
            if (aiMove) {
                draughts.move(aiMove);
                game.board = JSON.stringify({ board: draughts.board });
                game.total_moves += 1;
                await game.save();

                // Riduce i token del giocatore anche per la mossa dell'IA
                player.tokens -= MOVE_COST;
                await player.save();

                // Salva la mossa dell'IA nel database
                const fromPositionAI = moveService.convertPositionBack(aiMove.origin);
                const toPositionAI = moveService.convertPositionBack(aiMove.destination);

                await Move.create({
                    moveNumber: moveNumber + 1,
                    board: { board: draughts.board },
                    fromPosition: fromPositionAI,
                    toPosition: toPositionAI,
                    pieceType: savedBoard[aiMove.origin]?.piece?.king ? 'king' : 'single',
                    game_id: gameId,
                    user_id: null, // Indica che la mossa è dell'IA
                    details: {},
                });

                // Verifica se la mossa dell'IA ha concluso il gioco
                if ([DraughtsStatus.LIGHT_WON, DraughtsStatus.DARK_WON, DraughtsStatus.DRAW].includes(draughts.status as DraughtsStatus)) {
                    const gameOverResult = await moveService.handleGameOver(draughts, game);
                    game.status = GameStatus.COMPLETED;
                    game.ended_at = new Date();
                    await game.save();
                    return {
                        message: gameOverResult.message,
                        game_id: gameId,
                        board: gameOverResult.board,
                        moveDescription: `The game has ended: ${gameOverResult.message}`,
                    };
                }

                // Restituisci la risposta per PvE con entrambe le mosse
                return {
                    message: "Move successfully executed",
                    game_id: gameId,
                    moveDescription: `You moved a ${savedBoard[origin]?.piece?.king ? 'king' : 'single'} from ${from} to ${to}. ` +
                        `AI moved a ${savedBoard[aiMove.origin]?.piece?.king ? 'king' : 'single'} from ${fromPositionAI} to ${toPositionAI}.`,
                    // board: draughts.board
                };
            }
        }

        // Restituisci la risposta per PvP con la mossa del giocatore
        return {
            message: "Move successfully executed",
            game_id: gameId,
            moveDescription: `You moved a ${savedBoard[origin]?.piece?.king ? 'king' : 'single'} from ${from} to ${to}.`,
            // board: draughts.board
        };
    }

    /**
     * Gestisce la fine del gioco.
     *
     * Verifica lo stato del gioco per determinare il vincitore o se il gioco è finito in pareggio.
     *
     * @param draughts - L'istanza di `Draughts` che contiene lo stato della partita.
     * @param game - L'istanza del modello `Game` che rappresenta la partita nel database.
     * @returns {object} Un oggetto che descrive il risultato della partita e lo stato finale della scacchiera.
     */

    private static async handleGameOver(draughts: any, game: any) {
        let result;
        let winnerId: number | null = null;
        if (draughts.status === DraughtsStatus.LIGHT_WON) {
            winnerId = game.player_id;
            result = 'You have won!';
        } else if (draughts.status === DraughtsStatus.DARK_WON) {
            winnerId = game.opponent_id;
            result = 'Your opponent has won!';
        } else {
            result = 'The game ended in a draw!';
        }

        game.status = GameStatus.COMPLETED;
        game.ended_at = new Date();
        game.save();

        //Assegna un punto al vincitore, se esiste
        if (winnerId !== null) {
            const winner = await Player.findByPk(winnerId);
            if (winner) {
                winner.score += 1;
                await winner.save();
            }
        }

        return {
            message: result,
            board: draughts.board,
        };
    }

    /**
     * Recupera lo storico delle mosse per una specifica partita ed esporta nel formato richiesto (JSON o PDF).
     *
     * Questo metodo recupera tutte le mosse associate all'ID della partita specificato, ordinandole in ordine cronologico.
     * L'output può essere restituito in formato JSON o PDF, a seconda del valore del parametro `format`.
     *
     * @param {number} gameId - L'ID della partita di cui recuperare lo storico delle mosse.
     * @param {string} format - Il formato di esportazione desiderato ("json" o "pdf").
     * @returns {Promise<Buffer | object>} Una promessa che risolve con lo storico delle mosse nel formato richiesto:
     *                                     un array di oggetti nel caso di JSON, oppure un buffer nel caso di PDF.
     * @throws {Error} - Lancia un errore se non vengono trovate mosse per la partita specificata o se il formato è non supportato.
     */

    public static async exportMoveHistory(gameId: number, format: string): Promise<Buffer | object> {
        // Retrieve all moves for the specified game
        const moves = await Move.findAll({
            where: { game_id: gameId },
            order: [['createdAt', 'ASC']],
        });

        if (!moves.length) {
            throw new Error('No moves found for the specified game.');
        }

        // Handle export format
        if (format === 'json') {
            // Return as JSON
            return moves.map(move => ({
                moveNumber: move.moveNumber,
                fromPosition: move.fromPosition,
                toPosition: move.toPosition,
                pieceType: move.pieceType,
                timestamp: move.createdAt,
            }));
        } else if (format === 'pdf') {
            // Create a PDF document
            const doc = new PDFDocument();
            let buffer: Buffer;
            const buffers: Uint8Array[] = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => {
                buffer = Buffer.concat(buffers);
            });

            doc.fontSize(16).text(`Move History for Game ID: ${gameId}`, { align: 'center' });
            doc.moveDown();

            moves.forEach(move => {
                doc.fontSize(12).text(
                    `Move #${move.moveNumber}: From ${move.fromPosition} to ${move.toPosition} - Piece: ${move.pieceType} - Timestamp: ${move.createdAt}`
                );
                doc.moveDown();
            });

            // Finalize the PDF file
            doc.end();

            // Wait for the PDF to be fully generated before returning the buffer
            return new Promise<Buffer>((resolve) => {
                doc.on('end', () => resolve(buffer!));
            });
        } else {
            throw new Error('Unsupported format. Please choose "json" or "pdf".');
        }
    }

}

export default moveService;
