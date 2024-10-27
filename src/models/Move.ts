import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../db/database'; // Importa l'istanza Singleton del Database
import Game from './Game';
import Player from './Player';

/**
 * Interfaccia che definisce gli attributi del modello `Move`.
 */

interface MoveAttributes {
    id_move: number;
    game_id: number;
    user_id?: number | null;
    details: object;
    createdAt?: Date;
    updatedAt?: Date;
    moveNumber?: number;
    board?: object;
    fromPosition?: string;
    toPosition?: string;
    pieceType?: string;
}

/**
 * Interfaccia che definisce i tipi per l'inserimento di nuovi record `Move`.
 * Rende opzionali alcuni campi durante la creazione del record.
 */

interface MoveCreationAttributes extends Optional<MoveAttributes, 'id_move'> {}

/**
 * Classe che rappresenta il modello `Move`.
 *
 * Questa classe estende il modello di Sequelize per rappresentare una mossa,
 * con attributi come ID della partita, ID del giocatore, dettagli della mossa,
 * posizione di partenza e destinazione, e configurazione della tavola. Fornisce
 * metodi statici per l'inizializzazione e la configurazione delle associazioni
 * con altri modelli, come `Game` e `Player`.
 */

class Move extends Model<MoveAttributes, MoveCreationAttributes> implements MoveAttributes {
    public id_move!: number;
    public game_id!: number;
    public user_id?: number;
    public details!: object;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public moveNumber?: number;
    public board?: object;
    public fromPosition?: string;
    public toPosition?: string;
    public pieceType?: string;


    /**
     * Inizializza il modello `Move` con Sequelize.
     *
     * Configura gli attributi del modello e le impostazioni del database, come il nome
     * della tabella e l'utilizzo di timestamp.
     */

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
                    allowNull: true,
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

    /**
     * Configura le associazioni del modello `Move` con altri modelli.
     *
     * Associa il modello `Move` con il modello `Game` tramite una relazione "belongsTo",
     * e con il modello `Player` tramite una relazione "belongsTo" per il campo `user_id`.
     */

    public static associate() {
        // Associazioni con altri modelli
        Move.belongsTo(Game, { foreignKey: 'game_id', as: 'game' });
        Move.belongsTo(Player, { foreignKey: 'user_id', as: 'player' });
    }
}

export default Move;