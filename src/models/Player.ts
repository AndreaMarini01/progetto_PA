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
}

/**
 * Interfaccia che definisce i tipi per l'inserimento di nuovi record `Player`.
 * Rende opzionali alcuni campi durante la creazione del record.
 */

interface PlayerCreationAttributes extends Optional<PlayerAttributes, 'player_id'> {}

/**
 * Classe `Player` che rappresenta un giocatore.
 * Estende `Model` di Sequelize e implementa `PlayerAttributes` per assicurare i tipi di attributi.
 *
 * @extends Model
 *
 * @property {number} player_id - ID univoco del giocatore.
 * @property {string} username - Nome utente del giocatore, unico.
 * @property {string} email - Email del giocatore, unica.
 * @property {string} password_hash - Hash della password del giocatore.
 * @property {string} salt - Salt utilizzato per il hashing della password.
 * @property {number} tokens - Numero di token posseduti dal giocatore.
 * @property {PlayerRole} role - Ruolo del giocatore, può essere `USER` o `ADMIN`.
 * @property {number} score - Punteggio del giocatore.
 *
 * @method initialize
 * Inizializza il modello `Player` e definisce la struttura della tabella nel database.
 * Configura le proprietà della tabella, tra cui:
 *   - `player_id` - Chiave primaria autoincrementante.
 *   - `username` - Nome utente unico, obbligatorio.
 *   - `email` - Indirizzo email unico, obbligatorio.
 *   - `password_hash` - Hash della password, obbligatorio.
 *   - `salt` - Salt per la password, obbligatorio.
 *   - `tokens` - Numero di token del giocatore, con valore predefinito `0`.
 *   - `role` - Ruolo del giocatore, `USER` o `ADMIN`, con valore predefinito `user`.
 *   - `score` - Punteggio del giocatore.
 *
 * @method associate
 * Configura le associazioni di `Player` con altri modelli:
 *   - `hasMany` con `Move` - Un giocatore può effettuare molte mosse. Utilizza `user_id` come chiave esterna in `Move`.
 *   - `hasMany` con `Game` - Un giocatore può partecipare a molte partite. Utilizza `player_id` come chiave esterna in `Game`.
 *
 * @static
 * @param {Sequelize} sequelize - Oggetto Sequelize per inizializzare il modello.
 * @param {string} tableName - Nome della tabella nel database (`Player`).
 * @param {boolean} timestamps - Se impostato su `false`, disabilita i timestamp automatici.
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

    // Configura il modello Sequelize associato alla tabella Game nel database
    public static initialize() {
        // Inizializza il modello Move
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
                // Restituisce l'istanza singleton di Sequelize da utilizzare
                sequelize: Database.getSequelize(),
                tableName: 'Player',
                // Disabilita la creazione automatica dei campi createdAt e updatedAt
                timestamps: false
            }
        );
    }

    public static associate() {
        // Indica che un singolo Player può avere più Move (mosse) associate.
        // As definisce un alias moves per questa relazione, consentendo di accedere a tutte le mosse di un giocatore tramite player.moves
        Player.hasMany(Move, { foreignKey: 'user_id', as: 'moves' });
        // Specifica che un singolo Player può avere più Game (partite) associate.
        // As definisce un alias games per questa relazione, consentendo di accedere a tutte le partite di un giocatore tramite player.games
        Player.hasMany(Game, { foreignKey: 'player_id', as: 'games' });
    }
}

export default Player;