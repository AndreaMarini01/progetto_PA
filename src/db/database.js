'use strict';

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config(); // Carica le variabili d'ambiente dal file .env

/**
 * Classe singleton per la gestione della connessione al database utilizzando Sequelize.
 *
 * La classe `Database` fornisce una singola istanza della connessione a un database
 * utilizzando il modello singleton. Carica le variabili di configurazione dal file `.env`
 * e utilizza Sequelize per connettersi al database. La connessione viene configurata con
 * le credenziali e le impostazioni specificate nelle variabili d'ambiente.
 *
 * Le variabili d'ambiente utilizzate sono:
 * - `DB_NAME`: Nome del database.
 * - `DB_USER`: Nome utente per la connessione al database.
 * - `DB_PASSWORD`: Password per la connessione al database.
 * - `DB_HOST`: Host del database.
 * - `DB_DIALECT`: Dialetto del database (ad esempio, `postgres`, `mysql`).
 * - `DB_PORT`: Porta del database.
 *
 * La connessione è configurata per non mostrare i log delle query impostando `logging: false`.
 */

class Database {
    constructor() {
        if (!Database.instance) {
            this._sequelize = new Sequelize(
                process.env.DB_NAME,
                process.env.DB_USER,
                process.env.DB_PASSWORD,
                {
                    host: process.env.DB_HOST,
                    dialect: process.env.DB_DIALECT,
                    port: process.env.DB_PORT,
                    logging: false, // Imposta su true per visualizzare i log delle query
                }
            );
            Database.instance = this; // Salva l'istanza
        }
        return Database.instance;
    }

    /**
     * Ottiene l'istanza singleton della classe `Database`.
     *
     * Questo metodo statico fornisce l'accesso all'unica istanza della classe `Database`.
     * Se l'istanza non è già stata creata, viene creata e poi congelata per evitare modifiche
     * future. Questo garantisce che ci sia solo una connessione attiva al database.
     *
     * @returns {Database} L'istanza singleton della classe `Database`.
     */

    // Metodo statico per ottenere l'istanza
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
            // Congela l'istanza di Database per evitare modifiche esterne
            Object.freeze(Database);
        }
        return Database.instance;
    }

    /**
     * Ottiene l'oggetto Sequelize per la connessione al database.
     *
     * Questo metodo fornisce l'accesso diretto all'istanza Sequelize utilizzata per
     * la connessione al database, permettendo di eseguire operazioni con l'ORM.
     *
     * @returns {Sequelize} L'istanza Sequelize configurata.
     */

    getSequelize() {
        return this._sequelize;
    }
}

// Esporta globalmente l'istanza come default
module.exports = Database.getInstance();
