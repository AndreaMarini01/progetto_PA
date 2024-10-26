import Game, {GameStatus} from '../models/Game';
import Player from '../models/Player';
import Move from "../models/Move";
import {DraughtsMove1D, DraughtsSquare1D, DraughtsStatus} from 'rapid-draughts';
import {EnglishDraughts as Draughts} from 'rapid-draughts/english';
import MoveFactory, {moveErrorType} from "../factories/moveFactory";
import move from "../models/Move";

class MoveService {

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

        // Non penso sia necessario questo controllo
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
        let savedData: { initialBoard: DraughtsSquare1D[] } | null = null;

        // Converte la board in JSON
        try {
            console.log('Parsing board:', game.board);
            savedData = typeof game.board === 'string' ? JSON.parse(game.board) : game.board;
        } catch (error) {
            throw MoveFactory.createError(moveErrorType.FAILED_PARSING);
        }

        // Verifica che la board esista e che sia di tipo JSON
        const savedBoard = savedData?.initialBoard;
        if (!savedBoard || !Array.isArray(savedBoard)) {
            throw MoveFactory.createError(moveErrorType.NOT_VALID_ARRAY);
        }

        // Inizializza il gioco utilizzando la board salvata in precedenza
        const draughts = Draughts.setup();
        savedBoard.forEach((square, index) => {
            draughts.board[index] = square;
        });

        // Script per sapere quali sono tutte le mosse disponibili
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

        // Se la mossa è valida, la esegue
        draughts.move(moveToMake);

        // Serve per verificare che, in seguito ad una mossa, un giocatore ha vinto
        // Cambia anche lo stato della partita a completed e riempe il campo ended_at
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

        // Se la partita non è stata vinta, aggiorna lo stato della board e il numero totale di mosse,
        // aggiornandole nel database
        game.board = JSON.stringify({ initialBoard: draughts.board });
        game.total_moves = (game.total_moves || 0) + 1;
        await game.save();

        // Conta il numero totale di mosse associate al gioco specificato (sulla base di gameId) e le raggruppa per game_id.
        const groupedCounts = await Move.count({
            where: { game_id: gameId },
            group: ['game_id'],
        });

        const totalCount = Array.isArray(groupedCounts) && groupedCounts.length > 0 ? groupedCounts[0].count : 0;
        // Rappresenta il numero della mossa corrente e viene calcolato incrementando totalCount di 1.
        const moveNumber = totalCount + 1;

        // Creazione di una nuova mossa nel db
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
