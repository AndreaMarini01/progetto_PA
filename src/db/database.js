/**
 * Classe Singleton `Database` per gestire la connessione al database utilizzando Sequelize.
 *
 * @requires sequelize - Modulo `Sequelize` per la gestione delle connessioni al database.
 * @requires dotenv - Carica le variabili d'ambiente dal file `.env`.
 *
 * @class Database
 * @classdesc Gestisce la connessione al database e garantisce un'unica istanza della connessione (Singleton).
 *
 * @constructor
 * Crea una nuova istanza di `Database` se non esiste già e inizializza la connessione con le variabili d'ambiente:
 *   - `DB_NAME` - Nome del database.
 *   - `DB_USER` - Nome utente del database.
 *   - `DB_PASSWORD` - Password del database.
 *   - `DB_HOST` - Host del database.
 *   - `DB_DIALECT` - Dialetto del database, ad esempio 'postgres', 'mysql'.
 *   - `DB_PORT` - Porta di connessione al database.
 *
 * @method static getInstance
 * Ottiene l'istanza unica della classe `Database`.
 *   - Crea l'istanza se non esiste e la congela per evitare modifiche.
 *
 * @method getSequelize
 * Restituisce l'oggetto `Sequelize` per eseguire operazioni sul database.
 *
 * @example
 * // Ottenere l'istanza e accedere a Sequelize
 * const db = Database.getInstance();
 * const sequelize = db.getSequelize();
 *
 * @property {Sequelize} _sequelize - L'oggetto `Sequelize` che gestisce la connessione al database.
 * @property {Database} instance - La singola istanza della classe `Database`.
 */

'use strict';

// Importa Sequelize per gestire la connessione al database
const { Sequelize } = require('sequelize');
// Importa dotenv per caricare le variabili d'ambiente dal file .env
const dotenv = require('dotenv');
// Carica le variabili d'ambiente dal file .env
dotenv.config();

class Database {
    constructor() {
        // Controlla se un'istanza della classe Database esiste già
        if (!Database.instance) {
            // Crea una nuova istanza di Sequelize per gestire la connessione al database
            this._sequelize = new Sequelize(
                process.env.DB_NAME,
                process.env.DB_USER,
                process.env.DB_PASSWORD,
                {
                    host: process.env.DB_HOST,
                    dialect: process.env.DB_DIALECT,
                    port: process.env.DB_PORT,
                    logging: false,
                }
            );
            // Salva l'istanza corrente nella proprietà statica Database.instance
            Database.instance = this;
        }
        // Ritorna l'istanza esistente di Database
        return Database.instance;
    }

    // Metodo statico per ottenere l'istanza singleton di Database
    static getInstance() {
        // Se l'istanza non esiste, la crea e la congela per evitare modifiche
        if (!Database.instance) {
            Database.instance = new Database();
            Object.freeze(Database);
        }
        // Restituisce l'istanza unica
        return Database.instance;
    }

    // Metodo per ottenere l'istanza di Sequelize
    getSequelize() {
        return this._sequelize;
    }
}

// Esporta globalmente l'istanza singleton di Database
module.exports = Database.getInstance();
