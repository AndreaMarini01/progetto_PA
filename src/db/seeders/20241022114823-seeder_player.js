/**
 * Seeder per l'inserimento di utenti di esempio nella tabella `Player`.
 *
 * @param {object} queryInterface - L'interfaccia utilizzata per eseguire le query nel database.
 * @param {object} Sequelize - L'istanza di Sequelize che fornisce i tipi di dati per i campi della tabella.
 *
 * @function up
 * Inserisce un insieme di utenti di esempio nella tabella `Player` con i seguenti campi:
 *   - `username` (STRING) - Nome utente univoco per identificare l'utente.
 *   - `email` (STRING) - Email univoca dell'utente.
 *   - `password_hash` (STRING) - Hash della password generato con la funzione `hashPassword`.
 *   - `salt` (STRING) - Salt utilizzato per creare l'hash della password.
 *   - `tokens` (FLOAT) - Numero di token iniziali assegnati all'utente.
 *   - `role` (ENUM) - Ruolo dell'utente, può essere `user` o `admin`.
 *   - `score` (FLOAT) - Punteggio iniziale assegnato all'utente.
 *
 * @function down
 * Elimina tutti i record dalla tabella `Player`.
 *
 */

'use strict';

// Modulo nativo di Node per hashing della password
const crypto = require('crypto');

module.exports = {
  // Inserimento dei dati all'interno della tabella Player
  async up(queryInterface, Sequelize) {
    const players = [
      {
        username: 'Andrea Marini',
        email: 'andrea@gmail.com',
        // Hash della password
        ...hashPassword('password1'),
        tokens: 0.3,
        role: 'user',
        score: 10,
      },
      {
        username: 'Alessio Capriotti',
        email: 'alessio@gmail.com',
        // Hash della password
        ...hashPassword('password2'),
        tokens: 3,
        role: 'user',
        score: 7,
      },
      {
        username: 'Admin Admin',
        email: 'admin@gmail.com',
        // Hash della password
        ...hashPassword('adminpassword'),
        tokens: 200,
        role: 'admin',
        score: 2,
      }, {
        username: 'Prova Prova',
        email: 'prova@gmail.com',
        // Hash della password
        ...hashPassword('password3'),
        tokens: 3,
        role: 'user',
        score: 7,
      }
    ];
    await queryInterface.bulkInsert('Player', players, {});
    // Necessario per inserire separatamente un record rappresentante l'IA
    await queryInterface.bulkInsert('Player', [
      {
        player_id: -1,
        username: 'Artificial Intelligence',
        email: 'artificialintelligence@gmail.com',
        // Hash della password
        ...hashPassword('no_password'),
        tokens: 0,
        role: 'user',
        score: 0,
      }
    ], {});
  },
  // Eliminazione dei record dalla tabella Player
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Player', null, {});
  }
};

/**
 * Funzione di utilità per generare l'hash della password.
 *
 * @param {string} password - La password da hashare.
 * @param {string} [salt] - Salt per la creazione dell'hash. Se non specificato, viene generato casualmente.
 * @returns {object} Un oggetto contenente `salt` e `password_hash`.
 */

// pbkdf2Sync è la funzione per applicare l'algoritmo di hashing, 1000 è il numero di iterazioni dell'algoritmo di hashing,
// 64 sono i byte che compongono l'hash finale, sha256 è l'algoritmo di hashing
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return { salt, password_hash: hash };
}