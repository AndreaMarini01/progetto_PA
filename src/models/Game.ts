import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../db/database'; // Importa l'istanza Singleton del Database
import Player from './Player';
import Move from './Move';

export enum GameStatus {
    ONGOING = 'Ongoing',
    COMPLETED = 'Completed',
    ABANDONED = 'Abandoned',
    TIMED_OUT = 'Timed Out',
}

export enum GameType {
    PVP = 'PvP',
    PVE = 'PvE',
}

export enum AIDifficulty {
    ABSENT = 'Absent',
    EASY = 'Easy',
    HARD = 'Hard'
}

// Definisce i tipi per i campi del modello Game
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
}

// Definisce i tipi per l'inserimento di nuovi record
interface GameCreationAttributes extends Optional<GameAttributes, 'id_game' | 'ended_at' | 'ai_difficulty'> {}

// Crea la classe Game che estende il modello di Sequelize
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

    // Inizializza il modello Game con Sequelize
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

    // Metodo statico per configurare le associazioni
    public static associate() {
        // Associazioni con altri modelli
        Game.hasMany(Move, { foreignKey: 'game_id', as: 'moves' });
        Game.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });
        Game.belongsTo(Player, { foreignKey: 'opponent_id', as: 'opponent' });
    }
    }

    export default Game;