import { DataTypes, Model, Optional } from 'sequelize';
import Database from "../db/database";
import Move from './Move';
import Game from './Game';

/**
 * Enumerazione che definisce i ruoli possibili per un giocatore.
 */

export enum PlayerRole {
    USER = 'user',
    ADMIN = 'admin',
}

/**
 * Interfaccia che definisce gli attributi del modello `Player`.
 */

interface PlayerAttributes {
    player_id: number;
    username: string;
    email: string;
    password_hash: string;
    salt: string;
    tokens: number;
    role: PlayerRole;
    score: number;
    //createdAt?: Date;
    //updatedAt?: Date;
}

/**
 * Interfaccia che definisce i tipi per l'inserimento di nuovi record `Player`.
 * Rende opzionali alcuni campi durante la creazione del record.
 */

interface PlayerCreationAttributes extends Optional<PlayerAttributes, 'player_id'> {}

/**
 * Classe che rappresenta il modello `Player`.
 *
 * Questa classe estende il modello di Sequelize per rappresentare un giocatore,
 * con attributi come ID, nome utente, email, hash della password, token, ruolo,
 * e punteggio. Fornisce metodi statici per l'inizializzazione e la configurazione
 * delle associazioni con altri modelli, come `Move` e `Game`.
 */

class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
    public player_id!: number;
    public username!: string;
    public email!: string;
    public password_hash!: string;
    public salt!: string;
    public tokens!: number;
    public role!: PlayerRole;
    public score!: number;
    //public readonly createdAt!: Date;
    //public readonly updatedAt!: Date;

    /**
     * Inizializza il modello `Player` con Sequelize.
     *
     * Configura gli attributi del modello e le impostazioni del database, come il nome
     * della tabella e l'utilizzo di timestamp.
     */

    public static initialize() {
        Player.init(
            {
                player_id: {
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
                    type: DataTypes.ENUM(PlayerRole.USER, PlayerRole.ADMIN),
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
                timestamps: false
            }
        );
    }

    /**
     * Configura le associazioni del modello `Player` con altri modelli.
     *
     * Associa il modello `Player` con il modello `Move` tramite una relazione "hasMany",
     * e con il modello `Game` tramite una relazione "hasMany".
     */

    public static associate() {
        Player.hasMany(Move, { foreignKey: 'user_id', as: 'moves' });
        Player.hasMany(Game, { foreignKey: 'player_id', as: 'games' });
    }
    }

    export default Player;