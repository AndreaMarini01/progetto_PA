import Game, { GameType, GameStatus, AIDifficulty } from '../models/Game';
import Player from '../models/Player';

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
        throw new Error('Giocatore non trovato.');
    }

    // Verifica che il giocatore abbia credito sufficiente per creare la partita
    if (player.tokens < GAME_CREATION_COST) {
        throw new Error('Credito insufficiente per creare la partita.');
    }

    // Deduce il costo di creazione della partita
    player.tokens -= GAME_CREATION_COST;
    await player.save();

    let opponentId: number | null = null;
    if (type === GameType.PVP) {
        if (!opponentEmail) {
            throw new Error('Email dell\'avversario mancante per una partita PvP.');
        }
        const opponent = await Player.findOne({ where: { email: opponentEmail } });
        if (!opponent) {
            throw new Error('Avversario non trovato.');
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
