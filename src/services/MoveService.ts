/**
 * Servizio `MoveService` per gestire le operazioni di mossa all'interno delle partite,
 * inclusa la gestione delle mosse dei giocatori e dell'IA, timeout, e generazione di report.
 *
 * @constant {number} TIMEOUT_MINUTES - Timeout di inattività per una mossa, dopo il quale la partita è persa.
 * @constant {number} MOVE_COST - Costo in token per ogni mossa.
 *
 * @method chooseAIMove
 * Genera una mossa per l'IA in base alla difficoltà selezionata (EASY o HARD).
 * @param {any} draughts - Istanza del gioco di dama.
 * @param {AIDifficulty} difficulty - Difficoltà dell'IA (`EASY`, `HARD`, `ABSENT`).
 * @returns {Promise<DraughtsMove1D | null>} - La mossa scelta dall'IA o `null` se non disponibile.
 *
 * @method convertPosition
 * Converte una posizione in notazione scacchistica (es. "E2") in un indice numerico.
 * @param {string} position - Posizione in notazione scacchistica.
 * @returns {number} - Indice numerico corrispondente.
 *
 * @method convertPositionBack
 * Converte un indice numerico in una posizione in notazione scacchistica (es. 25 -> "E4").
 * @param {number} index - Indice numerico.
 * @returns {string} - Posizione in notazione scacchistica.
 *
 * @method executeMove
 * Esegue la mossa di un giocatore, aggiornando lo stato del gioco e la board.
 * Controlla se la mossa è valida e gestisce le risposte PvP e PvE.
 * @param {number} gameId - ID della partita.
 * @param {string} from - Posizione di partenza in notazione scacchistica.
 * @param {string} to - Posizione di destinazione.
 * @param {number} playerId - ID del giocatore.
 * @throws {MoveError} - Errori legati alle mosse, inclusi timeout, turno non valido e mossa non valida.
 * @returns {Promise<object>} - Dettagli della mossa e stato della partita.
 *
 * @method handleGameOver
 * Aggiorna lo stato del gioco e assegna punteggio al vincitore.
 * @param {any} draughts - Istanza del gioco.
 * @param {any} game - Partita in corso.
 * @returns {Promise<object>} - Messaggio di risultato e board finale.
 *
 * @method exportMoveHistory
 * Esporta la cronologia delle mosse in formato JSON o PDF.
 * @param {number} gameId - ID della partita.
 * @param {string} format - Formato di esportazione: `json` o `pdf`.
 * @throws {MoveError} - Errore se non ci sono mosse disponibili o il formato è errato.
 * @returns {Promise<Buffer | object>} - Buffer PDF o JSON con la cronologia delle mosse.
 */

import Game, {AIDifficulty, GameStatus, GameType} from '../models/Game';
import Player from '../models/Player';
import Move from "../models/Move";
import {DraughtsMove1D, DraughtsSquare1D, DraughtsStatus} from 'rapid-draughts';
import {
    EnglishDraughts,
    EnglishDraughtsComputerFactory as ComputerFactory,
    EnglishDraughtsGame
} from 'rapid-draughts/english';
import MoveFactory, {moveErrorType} from "../factories/MoveFactory";
import AuthFactory, {authErrorType} from "../factories/AuthFactory";
import GameFactory, {gameErrorType} from "../factories/GameFactory";
import PDFDocument from 'pdfkit';
import moment from 'moment';

const TIMEOUT_MINUTES = 1;
const MOVE_COST = 0.02;

class MoveService {

    // Proprietà statica e privata per evitare di inizializzare la board di gioco ad ogni mossa
    private static draughts: EnglishDraughtsGame = EnglishDraughts.setup();

    // Funzione per effettuare la mossa dell'IA a seconda del livello di difficoltà
    private static async chooseAIMove(draughts: any, difficulty: AIDifficulty): Promise<DraughtsMove1D | null> {
        // Metodo di rapid-draughts per ottenere le mosse valide da una data configurazione
        const validMoves = draughts.moves;
        if (validMoves.length === 0) return null;
        switch (difficulty) {
            case AIDifficulty.EASY:
                // Se la difficoltà è EASY, usa il computer casuale
                const randomComputer = ComputerFactory.random();
                return await randomComputer(draughts);
            case AIDifficulty.HARD:
                // Se la difficoltà è HARD, usa il computer AlphaBeta (rapid-draughts) con maxDepth pari a 5
                const alphaBetaComputer = ComputerFactory.alphaBeta({maxDepth: 5});
                return await alphaBetaComputer(draughts);
            default:
                // Difficoltà ASSENTE, l'IA non deve fare mosse
                return null;
        }
    }

    // Converte la posizione scacchistica (A1) in un numero che rappresenta una cella
    public static convertPosition(position: string): number {
        const file = position.charCodeAt(0) - 'A'.charCodeAt(0);
        const rank = 8 - parseInt(position[1]);
        // Solo le caselle scure occupabili in dama
        if ((file + rank) % 2 === 0) {
            throw new Error("La posizione specificata non è una casella scura valida nella dama.");
        }
        // Calcola l'indice per le sole caselle scure
        return Math.floor((rank * 4) + (file / 2)) + 1;
    }

    // Converte il numero che rappresenta la cella in una posizione scacchistica (A1)
    public static convertPositionBack(index: number): string {
        if (index < 1 || index > 32) {
            throw new Error("Indice non valido per una casella scura.");
        }
        // Calcola la riga e la colonna per le caselle scure
        const rank = Math.floor((index - 1) / 4);
        const file = ((index - 1) % 4) * 2 + (rank % 2 === 0 ? 1 : 0);
        const fileLetter = String.fromCharCode('A'.charCodeAt(0) + file);
        const rankNumber = 8 - rank;
        return `${fileLetter}${rankNumber}`;
    }

    public static async executeMove(gameId: number, from: string, to: string, playerId: number) {
        const player = await Player.findByPk(playerId);
        if (!player) {
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
        // Recupera l'ultima mossa per determinare il turno
        const lastMove = await Move.findOne({
            where: { game_id: gameId },
            order: [['move_number', 'DESC']]
        });
        // Se l'ultima mossa è stata fatta dal giocatore corrente, non è il suo turno
        if (lastMove && lastMove.user_id === playerId) {
            throw MoveFactory.createError(moveErrorType.NOT_PLAYER_TURN);
        }
        // Se il giocatore che esegue la mossa non è uno dei due giocatori coinvolti, restituisce un errore
        if (game.player_id !== playerId && game.opponent_id !== playerId) {
            throw AuthFactory.createError(authErrorType.UNAUTHORIZED);
        }
        // Sottrae il costo della mossa
        player.tokens -= MOVE_COST;
        await player.save();
        // Variabile per la board di gioco salvata
        let savedData: { board: DraughtsSquare1D[] } | null = null;
        // Converte la board in JSON
        try {
            savedData = typeof game.board === 'string' ? JSON.parse(game.board) : game.board;
        } catch (error) {
            throw MoveFactory.createError(moveErrorType.FAILED_PARSING);
        }
        // Verifica che la board esista e che sia di tipo JSON
        const savedBoard = savedData?.board;
        // Errore di conversione della board
        if (!savedBoard || !Array.isArray(savedBoard)) {
            throw MoveFactory.createError(moveErrorType.NOT_VALID_ARRAY);
        }
        // Restituisce una board a singolo array con tutti gli elementi
        const flattenedBoard = savedBoard.flat();
        // Aggiorna la configurazione della scacchiera nell'oggetto MoveService.draughts.board usando i valori di flattenedBoard.
        flattenedBoard.forEach((square, index) => {
            MoveService.draughts.board[index] = square;
        });
        console.log("Mosse possibili dalla configurazione data:");
        // Serve per ottenere le mosse disponibili da una data configurazione
        MoveService.draughts.moves.forEach(move => {
            const moveFrom = MoveService.convertPositionBack(move.origin);
            const moveTo = MoveService.convertPositionBack(move.destination);
            console.log(`Mossa: da ${moveFrom} a ${moveTo}`);
        });
        // Mossa passata alla funzione in notazione numerica
        const origin = MoveService.convertPosition(from);
        const destination = MoveService.convertPosition(to);
        // Verifica che sia una mossa valida
        const validMoves = MoveService.draughts.moves;
        const moveToMake = validMoves.find(move => move.origin === origin && move.destination === destination);
        // Nel caso non lo fosse lancia un errore
        if (!moveToMake) {
            throw MoveFactory.createError(moveErrorType.NOT_VALID_MOVE);
        }
        // Ottiene l'ultima mossa effettuata da un player per uno stesso game
        const lastPlayerMove = await Move.findOne({
            where: {
                game_id: gameId,
                user_id: playerId
            },
            order: [['created_at', 'DESC']]
        });
        if (lastPlayerMove) {
            const lastMoveTime = new Date(lastPlayerMove.created_at);
            const currentTime = new Date();
            // Calcola la differenza tra la data di creazione dell'ultima mossa e la data di creazione della mossa attuale
            const timeDifference = (currentTime.getTime() - lastMoveTime.getTime()) / (1000 * 60);
            // Se la differenza di tempo è maggiore della soglia prestabilita, chiude la partita per time out
            if (timeDifference > TIMEOUT_MINUTES) {
                // Imposta lo stato della partita come persa per "timeout"
                game.status = GameStatus.TIMED_OUT;
                game.ended_at = currentTime;
                if (game.opponent_id === -1) {
                    // La partita è contro l'IA, quindi l'IA vince
                    game.winner_id = -1;
                } else {
                    // La partita è PvP, quindi l'altro giocatore vince
                    game.winner_id = (game.player_id === playerId) ? game.opponent_id ?? null : game.player_id ?? null;
                }
                await game.save();
                // Decrementa il punteggio del perdente di 0.5 punti
                const player = await Player.findByPk(playerId);
                if (player) {
                    player.score -= 0.5;
                    await player.save();
                }
                // Incrementa il punteggio del vincitore di 1 punto
                if (game.winner_id) {
                    const winner = await Player.findByPk(game.winner_id);
                    if (winner) {
                        winner.score += 1;
                        await winner.save();
                    }
                }
                throw MoveFactory.createError(moveErrorType.TIME_OUT);
            }
        }
        // Controlla se la mossa corrente è uguale all'ultima mossa effettuata dallo stesso player
        if (lastPlayerMove && lastPlayerMove.from_position === from && lastPlayerMove.to_position === to) {
            // Nel caso lo fosse, lancia un errore
            throw MoveFactory.createError(moveErrorType.NOT_VALID_MOVE);
        }
        // Esegui la mossa del giocatore
        MoveService.draughts.move(moveToMake);
        // Aggiorna la board e salva la mossa del giocatore
        game.board = { board: MoveService.draughts.board };
        // Incrementa il numero di mosse della partita
        game.total_moves = (game.total_moves || 0) + 1;
        await game.save();
        // Tiene traccia del numero della mossa
        const moveNumber = game.total_moves;
        // Salva la mossa nel database
        await Move.create({
            move_number: moveNumber,
            board: {board: MoveService.draughts.board},
            from_position: from,
            to_position: to,
            // Verifica il tipo di pezzo
            piece_type: savedBoard[origin]?.piece?.king ? 'king' : 'single',
            game_id: gameId,
            user_id: playerId,
        });
        // Visualizzazione della scacchiera
        console.log(MoveService.draughts.asciiBoard())
        // Verifica se la mossa del giocatore ha concluso il gioco
        if ([DraughtsStatus.LIGHT_WON, DraughtsStatus.DARK_WON, DraughtsStatus.DRAW].includes(MoveService.draughts.status as DraughtsStatus)) {
            // Lancia la funzione gameOver
            const gameOverResult = await MoveService.handleGameOver(MoveService.draughts, game);
            // Restituisce la risposta
            return {
                message: gameOverResult.message,
                game_id: gameId,
                board: gameOverResult.board,
                moveDescription: `The game has ended: ${gameOverResult.message}`,
            };
        }
        // Se la partita è PvE, esegui anche la mossa dell'IA
        if (game.type === GameType.PVE) {
            // Recupera l'ultima mossa dell'IA
            const lastAIMove = await Move.findOne({
                where: {
                    game_id: gameId,
                    user_id: -1,
                },
                order: [['created_at', 'DESC']],
            });
            // Sceglie la mossa dell'IA sulla base del livello di difficoltà
            let aiMove = await MoveService.chooseAIMove(MoveService.draughts, game.ai_difficulty);
            // Verifica se se l'ultima mossa dell'IA (lastAIMove) è identica alla nuova mossa proposta (aiMove)
            if (lastAIMove && aiMove &&
                lastAIMove.from_position && lastAIMove.to_position &&
                aiMove.origin === MoveService.convertPosition(lastAIMove.from_position) &&
                aiMove.destination === MoveService.convertPosition(lastAIMove.to_position)) {
                // Elimina l'ultima mossa dell'IA dalle mosse valide
                const validMoves = MoveService.draughts.moves.filter(move =>
                    aiMove && (move.origin !== aiMove.origin || move.destination !== aiMove.destination)
                );
                // Scegli una mossa diversa (viene scelta la prima disponibile)
                aiMove = validMoves.length ? validMoves[0] : null;
            }
            // Se la mossa dell'IA esiste
            if (aiMove) {
                // Effettua la mossa
                MoveService.draughts.move(aiMove);
                // Salva la configurazione della board
                game.board = { board: MoveService.draughts.board };
                // Aggiorna il numero di mosse
                game.total_moves += 1;
                await game.save();
                // Riduce i token del giocatore anche per la mossa dell'IA
                player.tokens -= MOVE_COST;
                await player.save();
                // Salva la mossa dell'IA nel database
                const fromPositionAI = MoveService.convertPositionBack(aiMove.origin);
                const toPositionAI = MoveService.convertPositionBack(aiMove.destination);
                // Aggiunge un nuovo record alla tabella Move
                await Move.create({
                    move_number: moveNumber + 1,
                    board: {board: MoveService.draughts.board},
                    from_position: fromPositionAI,
                    to_position: toPositionAI,
                    piece_type: savedBoard[aiMove.origin]?.piece?.king ? 'king' : 'single',
                    game_id: gameId,
                    user_id: -1,
                });
                // Stampa una rappresentazione della scacchiera in seguito alla mossa dell'IA
                console.log(MoveService.draughts.asciiBoard())
                // Verifica se la mossa dell'IA ha concluso il gioco
                if ([DraughtsStatus.LIGHT_WON, DraughtsStatus.DARK_WON, DraughtsStatus.DRAW].includes(MoveService.draughts.status as DraughtsStatus)) {
                    const gameOverResult = await MoveService.handleGameOver(MoveService.draughts, game);
                    return {
                        message: gameOverResult.message,
                        game_id: gameId,
                        board: gameOverResult.board,
                        moveDescription: `The game has ended: ${gameOverResult.message}`,
                    };
                }
                // Restituisci la risposta per PvE, indicando sia la mossa del giocatore che la mossa dell'IA
                return {
                    message: "Move successfully executed",
                    game_id: gameId,
                    moveDescription: `You moved a ${savedBoard[origin]?.piece?.king ? 'king' : 'single'} from ${from} to ${to}. ` +
                        `AI moved a ${savedBoard[aiMove.origin]?.piece?.king ? 'king' : 'single'} from ${fromPositionAI} to ${toPositionAI}.`,
                };
            }
        }
        // Restituisci la risposta per PvP con la mossa del giocatore
        return {
            message: "Move successfully executed",
            game_id: gameId,
            moveDescription: `You moved a ${savedBoard[origin]?.piece?.king ? 'king' : 'single'} from ${from} to ${to}.`,
        };
    }

    // Funzione per stabilire la fine di una partita
    private static async handleGameOver(draughts: any, game: any) {
        let result;
        // Imposta di default l'id del vincitore pari a -1 (IA)
        let winnerId: number = -1;
        // Hanno vinto i bianchi
        if (draughts.status === DraughtsStatus.LIGHT_WON) {
            winnerId = game.player_id;
            result = 'You have won!';
        // Hanno vinto i neri
        } else if (draughts.status === DraughtsStatus.DARK_WON) {
            if (game.type === GameType.PVE) {
                // Se è una partita PvE, l'IA ha vinto
                winnerId = -1;
                result = 'The AI has won!';
            } else {
                // Se è una partita PvP, l'avversario ha vinto
                winnerId = game.opponent_id;
                result = 'Your opponent has won!';
            }
        // Risultato di pareggio
        } else {
            result = 'The game ended in a draw!';
        }
        // Aggiorna lo stato del gioco
        game.status = GameStatus.COMPLETED;
        game.ended_at = new Date();
        game.winner_id = winnerId;
        await game.save();
        //Assegna un punto al vincitore
        const winner = await Player.findByPk(winnerId);
        if (winner) {
            winner.score += 1;
            await winner.save();
        }
        return {
            message: result,
            board: draughts.board,
        };
    }

    // Metodo per lo storico delle mosse
    public static async exportMoveHistory(gameId: number, format: string): Promise<Buffer | object> {
        // Recupera tutte le mosse di una partita specifica, utilizzando l'id
        const moves = await Move.findAll({
            where: {game_id: gameId},
            order: [['created_at', 'ASC']],
        });
        // Se non ci sono mosse, restituisce un errore
        if (!moves.length) {
            throw MoveFactory.createError(moveErrorType.NO_MOVES)
        }
        // Estrae gli `user_id` (new Set elimina i duplicati)
        const userIds = [...new Set(moves.map(move => move.user_id as number))];
        // Recupera gli username per gli `user_id`
        const players = await Player.findAll({
            where: { player_id: userIds },
            attributes: ['player_id', 'username'],
        });
        // Mappa gli `user_id agli username` corrispondenti
        const userMap = players.reduce((map, player) => {
            map[player.player_id] = player.username;
            return map;
        }, {} as Record<number, string>);
        // Mappa le mosse con l'username del giocatore, o "IA" se `user_id` è -1
        const movesWithUsernames = moves.map(move => ({
            move_number: move.move_number,
            from_position: move.from_position,
            to_position: move.to_position,
            piece_type: move.piece_type,
            created_at: moment.parseZone(move.created_at).format('YYYY-MM-DD HH:mm:ss'),
            username: move.user_id === -1 ? 'Artificial Intelligence' : userMap[move.user_id!] || 'Unknown Player',
        }));
        // Ritorna in formato JSON o PDF
        if (format === 'json') {
            return movesWithUsernames;
        } else if (format === 'pdf') {
            // Creazione del PDF
            const doc = new PDFDocument();
            let buffer: Buffer;
            const buffers: Uint8Array[] = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => {
                buffer = Buffer.concat(buffers);
            });
            doc.addPage();
            doc.fontSize(20).fillColor('#4B0082').text(`Move History for Game ID: ${gameId}`, { align: 'center' });
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#4B0082');
            doc.moveDown(1.5);
            movesWithUsernames.forEach((move, index) => {
                // Titolo della mossa con numero progressivo
                doc.fontSize(16).fillColor('#333').text(`Move #${move.move_number}`, { underline: true });
                // Dettagli della mossa
                doc.fontSize(12).fillColor('#000').text(`Player: ${move.username}`);
                doc.fontSize(12).fillColor('#000').text(`From: ${move.from_position}`);
                doc.fontSize(12).fillColor('#000').text(`To: ${move.to_position}`);
                doc.fontSize(12).fillColor('#000').text(`Piece: ${move.piece_type}`);
                doc.fontSize(12).fillColor('#000').text(`At time: ${move.created_at}`);
                doc.moveDown(1);
                // Linea separatrice per ogni mossa
                if (index < movesWithUsernames.length - 1) { // Evita di disegnare la linea per l'ultima mossa
                    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
                    doc.moveDown(1);
                }
            });
            // Fine della sezione
            doc.moveDown();
            doc.fontSize(14).fillColor('#4B0082').text('End of Move History', { align: 'center' });
            doc.end();
            return new Promise<Buffer>((resolve) => {
                doc.on('end', () => resolve(buffer!));
            });
        // Nel caso venga inserito un formato non valido
        } else {
            throw MoveFactory.createError(moveErrorType.INVALID_FORMAT);
        }
    }
}

export default MoveService;
