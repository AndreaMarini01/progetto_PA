import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../db/database'; // Importa l'istanza Singleton del Database
import Game from './Game';
import Player from './Player';

// Definisce i tipi per i campi del modello Move
interface MoveAttributes {
    id_move: number;
    game_id: number;
    user_id: number;
    details: object;
    createdAt?: Date;
    updatedAt?: Date;
    moveNumber?: number;
    board?: object;
    fromPosition?: string;
    toPosition?: string;
    pieceType?: string;
    move_number?: number;
}

// Definisce i tipi per l'inserimento di nuovi record
interface MoveCreationAttributes extends Optional<MoveAttributes, 'id_move'> {}

// Crea la classe Move che estende il modello di Sequelize
class Move extends Model<MoveAttributes, MoveCreationAttributes> implements MoveAttributes {
    public id_move!: number;
    public game_id!: number;
    public user_id!: number;
    public details!: object;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public moveNumber?: number;
    public board?: object;
    public fromPosition?: string;
    public toPosition?: string;
    public pieceType?: string;


    // Metodo statico per inizializzare il modello
    public static initialize() {
        Move.init(
            {
                id_move: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                game_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'Game',
                        key: 'id_game',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'Player',
                        key: 'id_player',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                details: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
                moveNumber: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                board: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                fromPosition: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                toPosition: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                pieceType: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            },
            {
                sequelize: Database.getSequelize(),
                tableName: 'Move',
                timestamps: true,
            }
        );
    }

    // Metodo statico per configurare le associazioni
    public static associate() {
        // Associazioni con altri modelli
        Move.belongsTo(Game, { foreignKey: 'game_id', as: 'game' });
        Move.belongsTo(Player, { foreignKey: 'user_id', as: 'player' });
    }
}

export default Move;