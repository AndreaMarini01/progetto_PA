import Game, { GameType, GameStatus, AIDifficulty } from '../models/Game';
import Player from '../models/Player';
import GameFactory, { gameErrorType } from '../factories/gameFactory';

const GAME_CREATION_COST = 0.35;

/**
 * Crea una nuova partita.
 * @param playerId L'ID del giocatore che crea la partita.
 * @param opponentEmail
 * @param type Il tipo di partita (PvP o PvE).
 * @param aiDifficulty La difficoltà dell'IA, se applicabile.
 * @returns La nuova partita creata.
 * @throws Error se si verificano problemi durante la creazione della partita.
 */
export const createGame = async (
    playerId: number,
    opponentEmail: number | null,
    type: GameType,
    aiDifficulty: AIDifficulty = AIDifficulty.ABSENT
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
        date: new Date()
    });

    return newGame;
};
