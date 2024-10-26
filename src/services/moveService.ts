import Game, {AIDifficulty, GameStatus, GameType} from '../models/Game';
import Player from '../models/Player';
import Move from "../models/Move";
import {DraughtsMove1D, DraughtsSquare1D, DraughtsStatus} from 'rapid-draughts';
import { EnglishDraughtsComputerFactory as ComputerFactory } from 'rapid-draughts/english';
import {EnglishDraughts as Draughts} from 'rapid-draughts/english';
import MoveFactory, {moveErrorType} from "../factories/moveFactory";


class MoveService {

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

    // Prende una posizione della scacchiera espressa come stringa ("A7")
    // e la converte in un numero intero corrispondente alla posizione unidimensionale sulla scacchiera.
    // Rapid-draughts utilizaa questo formato
    public static convertPosition(position: string): number {
        const file = position.charCodeAt(0) - 'A'.charCodeAt(0);
        const rank = 8 - parseInt(position[1]);
        return rank * 8 + file;
    }

    // Funzione inversa di convertPosition
    public static convertPositionBack(index: number): string {
        const file = String.fromCharCode('A'.charCodeAt(0) + (index % 8));
        const rank = 8 - Math.floor(index / 8);
        return `${file}${rank}`;
    }

    // Funzione principale per l'esecuzione della mossa
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
            const moveFrom = MoveService.convertPositionBack(move.origin);
            const moveTo = MoveService.convertPositionBack(move.destination);
            console.log(`Mossa: da ${moveFrom} a ${moveTo}`);
        });

        const origin = MoveService.convertPosition(from);
        const destination = MoveService.convertPosition(to);

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
            board: { initialBoard: draughts.board },
            fromPosition: from,
            toPosition: to,
            pieceType: savedBoard[origin]?.piece?.king ? 'king' : 'single',
            game_id: gameId,
            user_id: playerId,
            details: {},
        });

        // Verifica se la mossa del giocatore ha concluso il gioco
        if ([DraughtsStatus.LIGHT_WON, DraughtsStatus.DARK_WON, DraughtsStatus.DRAW].includes(draughts.status as DraughtsStatus)) {
            const gameOverResult = MoveService.handleGameOver(draughts, game);
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
            const aiMove = await MoveService.chooseAIMove(draughts, game.ai_difficulty);
            if (aiMove) {
                draughts.move(aiMove);
                game.board = JSON.stringify({ board: draughts.board });
                game.total_moves += 1;
                await game.save();

                // Salva la mossa dell'IA nel database
                const fromPositionAI = MoveService.convertPositionBack(aiMove.origin);
                const toPositionAI = MoveService.convertPositionBack(aiMove.destination);

                await Move.create({
                    moveNumber: moveNumber + 1,
                    board: { initialBoard: draughts.board },
                    fromPosition: fromPositionAI,
                    toPosition: toPositionAI,
                    pieceType: savedBoard[aiMove.origin]?.piece?.king ? 'king' : 'single',
                    game_id: gameId,
                    user_id: null, // Indica che la mossa è dell'IA
                    details: {},
                });

                // Verifica se la mossa dell'IA ha concluso il gioco
                if ([DraughtsStatus.LIGHT_WON, DraughtsStatus.DARK_WON, DraughtsStatus.DRAW].includes(draughts.status as DraughtsStatus)) {
                    const gameOverResult = MoveService.handleGameOver(draughts, game);
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

    private static handleGameOver(draughts: any, game: any) {
        let result;
        if (draughts.status === DraughtsStatus.LIGHT_WON) {
            game.winnerId = game.player1Id;
            result = 'You have won!';
        } else if (draughts.status === DraughtsStatus.DARK_WON) {
            game.winnerId = game.player2Id;
            result = 'Your opponent has won!';
        } else {
            result = 'The game ended in a draw!';
        }

        game.status = GameStatus.COMPLETED;
        game.save();

        return {
            message: result,
            board: draughts.board,
        };
    }
}


export default MoveService;
