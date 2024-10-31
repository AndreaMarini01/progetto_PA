import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../db/database'; // Importa l'istanza Singleton del Database
import Game from './Game';
import Player from './Player';
import moment from "moment-timezone";

/**
 * Interfaccia che definisce gli attributi del modello `Move`.
 */

interface MoveAttributes {
    move_id: number;
    game_id: number;
    user_id?: number | null;
    created_at?: Date;
    move_number?: number;
    board?: object;
    from_position?: string;
    to_position?: string;
    piece_type?: string;
}

/**
 * Interfaccia che definisce i tipi per l'inserimento di nuovi record `Move`.
 * Rende opzionali alcuni campi durante la creazione del record.
 */

interface MoveCreationAttributes extends Optional<MoveAttributes, 'move_id'> {}

/**
 * Classe `Move` che rappresenta una mossa in una partita di gioco.
 * Estende `Model` di Sequelize e implementa `MoveAttributes` per assicurare i tipi di attributi.
 *
 * @extends Model
 *
 * @property {number} move_id - ID univoco della mossa.
 * @property {number} game_id - ID della partita a cui appartiene la mossa.
 * @property {number | undefined} user_id - ID dell'utente che ha effettuato la mossa, opzionale.
 * @property {Date} created_at - Data e ora in cui la mossa è stata effettuata.
 * @property {number | undefined} move_number - Numero progressivo della mossa nella partita.
 * @property {object | undefined} board - Configurazione della board al momento della mossa, rappresentata in formato JSON.
 * @property {string | undefined} from_position - Posizione di partenza della mossa.
 * @property {string | undefined} to_position - Posizione di destinazione della mossa.
 * @property {string | undefined} piece_type - Tipo di pezzo mosso, opzionale.
 *
 * @method initialize
 * Inizializza il modello `Move` e definisce la struttura della tabella nel database.
 * Configura le proprietà della tabella, tra cui:
 *   - `move_id` - Chiave primaria autoincrementante.
 *   - `game_id` - Riferimento alla tabella `Game`, con aggiornamento e cancellazione in cascata.
 *   - `user_id` - Riferimento alla tabella `Player`, può essere `null`.
 *   - `move_number` - Numero progressivo della mossa.
 *   - `board` - Configurazione della board al momento della mossa in formato JSON.
 *   - `from_position` e `to_position` - Posizioni di partenza e destinazione della mossa.
 *   - `piece_type` - Tipo di pezzo mosso.
 *   - `created_at` - Timestamp della mossa, impostato alla data e ora correnti.
 *
 * @method associate
 * Configura le associazioni di `Move` con altri modelli:
 *   - `belongsTo` con `Game` - Ogni mossa appartiene a una singola partita, identificata da `game_id`.
 *   - `belongsTo` con `Player` (come `player`) - Ogni mossa può essere associata a un giocatore (`user_id`).
 *
 * @static
 * @param {Sequelize} sequelize - Oggetto Sequelize per inizializzare il modello.
 * @param {string} tableName - Nome della tabella nel database (`Move`).
 * @param {boolean} timestamps - Se impostato su `false`, disabilita i timestamp automatici.
 */

class Move extends Model<MoveAttributes, MoveCreationAttributes> implements MoveAttributes {
    public move_id!: number;
    public game_id!: number;
    public user_id?: number;
    public readonly created_at!: Date;
    public move_number?: number;
    public board?: object;
    public from_position?: string;
    public to_position?: string;
    public piece_type?: string;

    public static initialize() {
        Move.init(
            {
                move_id: {
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
                        key: 'game_id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'Player',
                        key: 'player_id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                move_number: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                board: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                from_position: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                to_position: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                piece_type: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                    get() {
                        const rawDate = this.getDataValue('created_at');
                        return rawDate ? moment(rawDate).tz('Europe/Rome').format() : null;
                    }
                },
            },
            {
                sequelize: Database.getSequelize(),
                tableName: 'Move',
                timestamps: false,
            }
        );
    }

    public static associate() {
        // Associazioni con altri modelli
        Move.belongsTo(Game, { foreignKey: 'game_id', as: 'game' });
        Move.belongsTo(Player, { foreignKey: 'user_id', as: 'player' });
    }
}

export default Move;