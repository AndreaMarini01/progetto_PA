import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../db/database'; // Importa l'istanza Singleton del Database
import Player from './Player';
import Move from './Move';

/**
 * Enumerazione che definisce gli stati possibili per il gioco.
 */

export enum GameStatus {
    ONGOING = 'ongoing',
    COMPLETED = 'completed',
    ABANDONED = 'abandoned',
    TIMED_OUT = 'timed out',
}

/**
 * Enumerazione che definisce i tipi di gioco.
 */

export enum GameType {
    PVP = 'pvp',
    PVE = 'pve'
}

/**
 * Enumerazione che definisce i livelli di difficoltà dell'IA.
 */

export enum AIDifficulty {
    ABSENT = 'absent',
    EASY = 'easy',
    HARD = 'hard',
}

/**
 * Interfaccia che definisce gli attributi del modello `Game`.
 */

interface GameAttributes {
    game_id: number;
    player_id: number;
    opponent_id?: number | null;
    status: GameStatus;
    created_at?: Date;
    ended_at?: Date;
    type: GameType;
    ai_difficulty: AIDifficulty;
    board: any;
    total_moves: number;
    winner_id: number | null;
}

/**
 * Interfaccia che definisce i tipi per l'inserimento di nuovi record `Game`.
 * Rende opzionali alcuni campi durante la creazione del record.
 */

interface GameCreationAttributes extends Optional<GameAttributes, 'game_id' | 'ended_at' | 'ai_difficulty'> {}

/**
 * Classe `Game` che rappresenta una partita di gioco.
 * Estende `Model` di Sequelize e implementa `GameAttributes` per assicurare i tipi di attributi.
 *
 * @extends Model
 *
 * @property {number} game_id - ID univoco della partita.
 * @property {number} player_id - ID del giocatore che ha avviato la partita.
 * @property {number | null} opponent_id - ID dell'avversario, può essere `null` se si tratta di una partita contro l'IA.
 * @property {GameStatus} status - Stato attuale della partita, ad esempio `ONGOING`, `COMPLETED`, `ABANDONED`, `TIMED_OUT`.
 * @property {Date} created_at - Data e ora di creazione della partita.
 * @property {Date | null} ended_at - Data e ora di fine partita, può essere `null` se la partita è in corso.
 * @property {GameType} type - Tipo di partita, può essere `PVP` (Player vs Player) o `PVE` (Player vs Environment).
 * @property {AIDifficulty} ai_difficulty - Difficoltà dell'IA per le partite PvE, ad esempio `ABSENT`, `EASY`, `HARD`.
 * @property {any} board - Stato attuale della board di gioco, rappresentato in formato JSON.
 * @property {number} total_moves - Numero totale di mosse effettuate nella partita, con valore predefinito `0`.
 * @property {number | null} winner_id - ID del vincitore della partita, o `null` se non è stata ancora vinta.
 *
 * @method initialize
 * Inizializza il modello `Game` e definisce la struttura della tabella nel database.
 * Configura le associazioni con altri modelli e imposta le proprietà della tabella, tra cui:
 *   - `game_id` - Chiave primaria, intero autoincrementante.
 *   - `player_id` - Riferimento alla tabella `Player`.
 *   - `opponent_id` - Riferimento alla tabella `Player`, può essere `null`.
 *   - `status` - Enumerazione che definisce lo stato della partita.
 *   - `created_at` - Data di creazione della partita.
 *   - `ended_at` - Data di fine partita, facoltativa.
 *   - `type` - Tipo di partita, PvP o PvE.
 *   - `ai_difficulty` - Difficoltà dell'IA per le partite PvE.
 *   - `board` - JSON che rappresenta la configurazione della board.
 *   - `total_moves` - Numero di mosse effettuate.
 *   - `winner_id` - ID del vincitore, può essere `null`.
 *
 * @method associate
 * Configura le associazioni di `Game` con altri modelli:
 *  - `hasMany` con `Move` - Una partita può avere molte mosse. Utilizza `game_id` come chiave esterna in `Move`.
 *  - `belongsTo` con `Player` (come `player`) - Ogni partita appartiene a un giocatore che la inizia, utilizzando `player_id` come chiave esterna.
 *  - `belongsTo` con `Player` (come `opponent`) - Ogni partita può avere un avversario (un altro giocatore) identificato da `opponent_id`.
 *
 * @static
 * @param {Sequelize} sequelize - Oggetto Sequelize per inizializzare il modello.
 * @param {string} tableName - Nome della tabella nel database (`Game`).
 * @param {boolean} timestamps - Se impostato su `false`, disabilita i timestamp automatici.
 */

class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
    public game_id!: number;
    public player_id!: number;
    public opponent_id?: number | null;
    public status!: GameStatus;
    public created_at!: Date;
    public ended_at?: Date;
    public type!: GameType;
    public ai_difficulty!: AIDifficulty;
    public board!: any;
    public total_moves!: number;
    public winner_id!: number | null;

    public static initialize() {
        Game.init(
            {
                game_id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                player_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: Player,
                        key: 'player_id',
                    },
                },
                opponent_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: Player,
                        key: 'player_id',
                    },
                },
                status: {
                    type: DataTypes.ENUM(GameStatus.ONGOING, GameStatus.COMPLETED, GameStatus.ABANDONED, GameStatus.TIMED_OUT),
                    allowNull: false,
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                ended_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                type: {
                    type: DataTypes.ENUM(GameType.PVP, GameType.PVE),
                    allowNull: false,
                },
                ai_difficulty: {
                    type: DataTypes.ENUM(AIDifficulty.ABSENT, AIDifficulty.EASY, AIDifficulty.HARD),
                    allowNull: false,
                    defaultValue: AIDifficulty.ABSENT
                },
                board: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
                total_moves: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                winner_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    defaultValue: null
                }
            },
            {
                sequelize: Database.getSequelize(),
                tableName: 'Game',
                timestamps: false,
                createdAt: 'created_at',
            }
        );
    }

    public static associate() {
        Game.hasMany(Move, { foreignKey: 'game_id', as: 'moves' });
        Game.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });
        Game.belongsTo(Player, { foreignKey: 'opponent_id', as: 'opponent' });
    }
}

export default Game;