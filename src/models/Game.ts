import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../db/database'; // Importa l'istanza Singleton del Database
import Player from './Player';
import Move from './Move';

/**
 * Enumerazione che definisce gli stati possibili per il gioco.
 */

export enum GameStatus {
    ONGOING = 'Ongoing',
    COMPLETED = 'Completed',
    ABANDONED = 'Abandoned',
    TIMED_OUT = 'Timed Out',
}

/**
 * Enumerazione che definisce i tipi di gioco.
 */

export enum GameType {
    PVP = 'PvP',
    PVE = 'PvE'
}

/**
 * Enumerazione che definisce i livelli di difficoltà dell'IA.
 */

export enum AIDifficulty {
    ABSENT = 'Absent',
    EASY = 'Easy',
    HARD = 'Hard',
}

/**
 * Interfaccia che definisce gli attributi del modello `Game`.
 */

interface GameAttributes {
    id_game: number;
    player_id: number;
    opponent_id?: number | null;
    status: GameStatus;
    created_at?: Date;
    ended_at?: Date;
    type: GameType;
    ai_difficulty: AIDifficulty;
    updatedAt?: Date;
    date: Date;
    board: any;
    total_moves: number;
}

/**
 * Interfaccia che definisce i tipi per l'inserimento di nuovi record `Game`.
 * Rende opzionali alcuni campi durante la creazione del record.
 */

interface GameCreationAttributes extends Optional<GameAttributes, 'id_game' | 'ended_at' | 'ai_difficulty'> {}

/**
 * Classe che rappresenta il modello `Game`.
 *
 * Questa classe estende il modello di Sequelize per rappresentare una partita, con
 * attributi come ID del giocatore, ID dell'avversario, stato, tipo, difficoltà
 * dell'IA, configurazione della tavola e numero totale di mosse. Fornisce metodi
 * statici per l'inizializzazione e la configurazione delle associazioni con altri
 * modelli, come `Player` e `Move`.
 */

class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
    public id_game!: number;
    public player_id!: number;
    public opponent_id?: number | null;
    public status!: GameStatus;
    public created_at!: Date;
    public ended_at?: Date;
    public type!: GameType;
    public ai_difficulty!: AIDifficulty;
    public readonly updatedAt!: Date;
    public date!: Date;
    public board!: any;
    public total_moves!: number;

    /**
     * Inizializza il modello `Game` con Sequelize.
     *
     * Configura gli attributi del modello e le impostazioni del database, come il nome
     * della tabella e l'utilizzo di timestamp personalizzati.
     */

    public static initialize() {
        Game.init(
            {
                id_game: {
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
                        key: 'id_player',
                    },
                },
                opponent_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: Player,
                        key: 'id_player',
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
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                date: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                board: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
                total_moves: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                }
            },
            {
                sequelize: Database.getSequelize(),
                tableName: 'Game',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updatedAt',
            }
        );
    }

    /**
     * Configura le associazioni del modello `Game` con altri modelli.
     *
     * Associa il modello `Game` con il modello `Move` tramite una relazione "hasMany",
     * e con il modello `Player` tramite relazioni "belongsTo" per i campi `player_id` e `opponent_id`.
     */

    public static associate() {
        // Associazioni con altri modelli
        Game.hasMany(Move, { foreignKey: 'game_id', as: 'moves' });
        Game.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });
        Game.belongsTo(Player, { foreignKey: 'opponent_id', as: 'opponent' });
    }
}

export default Game;