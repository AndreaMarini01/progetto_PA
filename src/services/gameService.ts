import Game, { GameType, GameStatus, AIDifficulty } from '../models/Game';
import Player from '../models/Player';
import GameFactory, { gameErrorType } from '../factories/gameFactory';
import { Op } from 'sequelize';
import AuthFactory, {authErrorType} from "../factories/authFactory";

const GAME_CREATION_COST = 0.35;

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

export const findActiveGameForPlayer = async (playerId: number, opponentId: number | null) => {
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
};

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

export const createGame = async (
    playerId: number,
    opponentEmail: number | null,
    type: GameType,
    aiDifficulty: AIDifficulty = AIDifficulty.ABSENT,
    board: any,
    total_moves: number,
) => {
    // Recupera il giocatore dal database
    const player = await Player.findByPk(playerId);
    if (!player) {
        throw GameFactory.createError(gameErrorType.MISSING_PLAYER_ID);
    }
    // Verifica che il giocatore abbia credito sufficiente per creare la partita
    if (player.tokens < GAME_CREATION_COST) {
        throw GameFactory.createError(gameErrorType.INSUFFICIENT_CREDIT);
    }
    // Deduce il costo di creazione della partita
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

    // Crea la partita
    const newGame = await Game.create({
        player_id: playerId,
        opponent_id: type === GameType.PVP ? opponentId : null,
        status: GameStatus.ONGOING,
        type,
        ai_difficulty: type === GameType.PVE ? aiDifficulty : AIDifficulty.ABSENT,
        date: new Date(),
        board:board,
        total_moves
    });

    return newGame;
};

export const abandonGame = async (gameId: number, playerId: number): Promise<Game> => {
    const game = await Game.findByPk(gameId);
    if (!game) {
        throw GameFactory.createError(gameErrorType.INVALID_GAME_PARAMETERS);
    }
    // Controlla se l'utente è uno dei giocatori coinvolti nella partita
    if (game.player_id !== playerId && game.opponent_id !== playerId) {
        throw AuthFactory.createError(authErrorType.UNAUTHORIZED);
    }
    if (game.status !== GameStatus.ONGOING) {
        throw GameFactory.createError(gameErrorType.GAME_NOT_IN_PROGRESS);
    }
    // Aggiorna lo stato della partita a "Abandoned"
    game.status = GameStatus.ABANDONED;
    game.ended_at = new Date();
    await game.save();
    return game;
};


