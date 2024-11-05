/**
 * Configurazione del database per gli ambienti di sviluppo.
 *
 * @requires dotenv - Carica le variabili d'ambiente dal file `.env`.
 *
 * @property {object} development - Configurazione per l'ambiente di sviluppo.
 *   - `username` {string | undefined} - Nome utente per la connessione al database, ottenuto da `process.env.DB_USER`.
 *   - `password` {string | undefined} - Password per la connessione al database, ottenuta da `process.env.DB_PASSWORD`.
 *   - `database` {string | undefined} - Nome del database, ottenuto da `process.env.DB_NAME`.
 *   - `host` {string | undefined} - Host del database, ottenuto da `process.env.DB_HOST`.
 *   - `port` {number | undefined} - Porta per la connessione al database, ottenuta da `process.env.DB_PORT`.
 *   - `dialect` {string | undefined} - Dialetto del database (es. 'postgres', 'mysql'), ottenuto da `process.env.DB_DIALECT`.
 */

// Carica le variabili d'ambiente dal file .env
const dotenv = require('dotenv');
// Configura dotenv per rendere disponibili le variabili d'ambiente definite nel file .env
dotenv.config();
// Esporta la configurazione del database per l'ambiente di sviluppo
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