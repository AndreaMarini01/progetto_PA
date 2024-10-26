import Game from '../models/Game';
import Player from '../models/Player';
import Move from "../models/Move";
import { DraughtsSquare1D, DraughtsStatus } from 'rapid-draughts';
import { EnglishDraughts as Draughts } from 'rapid-draughts/english';

class MoveService {
    private static convertPosition(position: string): number {
        const file = position.charCodeAt(0) - 'A'.charCodeAt(0);
        const rank = 8 - parseInt(position[1]);
        return rank * 8 + file;
    }

    private static convertPositionBack(index: number): string {
        const file = String.fromCharCode('A'.charCodeAt(0) + (index % 8));
        const rank = 8 - Math.floor(index / 8);
        return `${file}${rank}`;
    }

    public static async executeMove(gameId: number, from: string, to: string, playerId: number) {
        console.log('Eseguendo la mossa:', { gameId, from, to, playerId });

        const player = await Player.findByPk(playerId);
        if (!player) {
            console.log('Giocatore non trovato:', playerId);
            throw new Error("Player not found.");
        }

        const game = await Game.findByPk(gameId);
        if (!game) {
            console.log('Gioco non trovato:', gameId);
            throw new Error("Game not found.");
        }

        let savedData: { initialBoard: DraughtsSquare1D[] } | null = null;
        try {
            console.log('Parsing board:', game.board);
            savedData = typeof game.board === 'string' ? JSON.parse(game.board) : game.board;
        } catch (error) {
            console.log('Errore nel parsing della board:', error);
            throw new Error("Error parsing the game board.");
        }

        const savedBoard = savedData?.initialBoard;
        if (!savedBoard || !Array.isArray(savedBoard)) {
            console.log('La board salvata non è un array valido:', savedBoard);
            throw new Error("Saved board is not a valid array.");
        }

        const draughts = Draughts.setup();
        savedBoard.forEach((square, index) => {
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

        console.log('Mosse possibili dalla configurazione data:');
        draughts.moves.forEach(move => {
            const moveFrom = MoveService.convertPositionBack(move.origin);
            const moveTo = MoveService.convertPositionBack(move.destination);
            console.log(`Mossa: da ${moveFrom} a ${moveTo}`);
        });

        const validMoves = draughts.moves;
        const moveToMake = validMoves.find(move => move.origin === origin && move.destination === destination);
        if (!moveToMake) {
            console.log('Mossa non valida:', { origin, destination });
            throw new Error("Invalid move.");
        }

        draughts.move(moveToMake);

        if ([DraughtsStatus.LIGHT_WON, DraughtsStatus.DARK_WON, DraughtsStatus.DRAW].includes(draughts.status as DraughtsStatus)) {
            const gameOverResult = MoveService.handleGameOver(draughts, game);
            return {
                message: gameOverResult.message,
                game_id: gameId,
                board: gameOverResult.board,
                moveDescription: `The game has ended: ${gameOverResult.message}`,
            };
        }

        game.board = JSON.stringify({ initialBoard: draughts.board });
        game.total_moves = (game.total_moves || 0) + 1;
        await game.save();

        const groupedCounts = await Move.count({
            where: { game_id: gameId },
            group: ['game_id'],
        });

        const totalCount = Array.isArray(groupedCounts) && groupedCounts.length > 0 ? groupedCounts[0].count : 0;
        const moveNumber = totalCount + 1;

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

        return {
            message: "Move successfully executed",
            game_id: gameId,
            board: draughts.board,
            moveDescription: `You moved a ${savedBoard[origin]?.piece?.king ? 'king' : 'single piece'} from ${from} to ${to}.`
        };
    }

    private static handleGameOver(draughts: any, game: any) {
        let result;
        if (draughts.status === DraughtsStatus.LIGHT_WON) {
            game.winnerId = game.player1Id;
            result = 'Player 1 has won!';
        } else if (draughts.status === DraughtsStatus.DARK_WON) {
            game.winnerId = game.player2Id;
            result = 'Player 2 has won!';
        } else {
            result = 'The game ended in a draw!';
        }

        game.status = 'completed';
        game.save();

        return {
            message: result,
            board: draughts.board,
        };
    }
}

export default MoveService;
