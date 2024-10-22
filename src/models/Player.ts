import { DataTypes, Model, Optional } from 'sequelize';
import Database from "../db/database";
import Move from './Move';
import Game from './Game';

// Definisce i tipi per i campi del modello Player
interface PlayerAttributes {
    id_player: number;
    username: string;
    email: string;
    password_hash: string;
    salt: string;
    tokens: number;
    role: 'user' | 'admin';
    score: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Definisce i tipi per l'inserimento di nuovi record
interface PlayerCreationAttributes extends Optional<PlayerAttributes, 'id_player'> {}

// Crea la classe Player che estende il modello di Sequelize
class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
    public id_player!: number;
    public username!: string;
    public email!: string;
    public password_hash!: string;
    public salt!: string;
    public tokens!: number;
    public role!: 'user' | 'admin';
    public score!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Metodo statico per inizializzare il modello
    public static initialize() {
        Player.init(
            {
                id_player: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false
                },
                username: {
                    type: DataTypes.STRING,
                    unique: true,
                    allowNull: false
                },
                email: {
                    type: DataTypes.STRING,
                    unique: true,
                    allowNull: false
                },
                password_hash: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                salt: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                tokens: {
                    type: DataTypes.FLOAT,
                    allowNull: false,
                    defaultValue: 0
                },
                role: {
                    type: DataTypes.ENUM('user', 'admin'),
                    allowNull: false,
                    defaultValue: 'user'
                },
                score: {
                    type: DataTypes.FLOAT,
                    allowNull: false
                }
            },
            {
                sequelize: Database.getSequelize(),
                tableName: 'Player',
                timestamps: true
            }
        );
    }

    // Metodo statico per configurare le associazioni
    public static associate() {
        Player.hasMany(Move, { foreignKey: 'user_id', as: 'moves' });
        Player.hasMany(Game, { foreignKey: 'player_id', as: 'games' });
    }
    }

    export default Player;