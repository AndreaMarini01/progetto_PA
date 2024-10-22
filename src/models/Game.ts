import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../db/database'; // Importa l'istanza Singleton del Database
import Player from './Player';
import Move from './Move';

// Definisce i tipi per i campi del modello Game
interface GameAttributes {
    id_game: number;
    status: 'Ongoing' | 'Completed' | 'Abandoned' | 'Timed Out';
    created_at: Date;
    ended_at?: Date;
    type: 'PvP' | 'PvAI';
    ai_difficulty?: 'Easy' | 'Hard';
    updatedAt?: Date;
}

// Definisce i tipi per l'inserimento di nuovi record
interface GameCreationAttributes extends Optional<GameAttributes, 'id_game' | 'ended_at' | 'ai_difficulty'> {}

// Crea la classe Game che estende il modello di Sequelize
class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
    public id_game!: number;
    public status!: 'Ongoing' | 'Completed' | 'Abandoned' | 'Timed Out';
    public created_at!: Date;
    public ended_at?: Date;
    public type!: 'PvP' | 'PvAI';
    public ai_difficulty?: 'Easy' | 'Hard';
    public readonly updatedAt!: Date;

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
                status: {
                    type: DataTypes.ENUM('Ongoing', 'Completed', 'Abandoned', 'Timed Out'),
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
                    type: DataTypes.ENUM('PvP', 'PvAI'),
                    allowNull: false,
                },
                ai_difficulty: {
                    type: DataTypes.ENUM('Easy', 'Hard'),
                    allowNull: true,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
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
    }
    }

    export default Game;