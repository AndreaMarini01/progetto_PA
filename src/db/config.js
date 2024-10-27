const dotenv = require('dotenv'); // Carica le variabili d'ambiente dal file .env

dotenv.config();

/**
 * Configurazione del database per l'ambiente di sviluppo.
 *
 * Questo file di configurazione carica le variabili d'ambiente dal file `.env` utilizzando
 * la libreria `dotenv` e definisce i parametri per la connessione al database in ambiente
 * di sviluppo. I parametri includono il nome utente, la password, il nome del database,
 * l'host, la porta e il dialetto del database.
 *
 * Le variabili d'ambiente utilizzate sono:
 * - `DB_USER`: Nome utente per la connessione al database.
 * - `DB_PASSWORD`: Password per la connessione al database.
 * - `DB_NAME`: Nome del database.
 * - `DB_HOST`: Host del database.
 * - `DB_PORT`: Porta del database.
 * - `DB_DIALECT`: Dialetto del database (ad esempio, `postgres`, `mysql`).
 *
 * @type {Object} Configurazione per Sequelize.
 */

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
    },
};