'use strict';

const crypto = require('crypto');

/**
 * Seeder per l'inserimento di dati iniziali nella tabella 'Player'.
 *
 * Questo seeder crea un insieme di giocatori con password hashate e le inserisce
 * nella tabella 'Player'. Utilizza una funzione `hashPassword` per generare un hash
 * della password con un salt univoco per ciascun giocatore. Include anche un metodo
 * per rimuovere i dati inseriti dal database.
 *
 * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
 * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
 */

module.exports = {

  /**
   * Inserisce dati iniziali nella tabella 'Player', creando diversi giocatori con
   * password hashate, ruoli e punteggi specificati.
   *
   * - `username`: Nome dell'utente.
   * - `email`: Indirizzo email dell'utente.
   * - `password_hash` e `salt`: Hash della password e salt generati con la funzione `hashPassword`.
   * - `tokens`: Numero di token assegnati al giocatore.
   * - `role`: Ruolo dell'utente, può essere 'user' o 'admin'.
   * - `score`: Punteggio iniziale del giocatore.
   * - `createdAt` e `updatedAt`: Timestamp di creazione e aggiornamento.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento dell'operazione di inserimento.
   */

  async up(queryInterface, Sequelize) {
    // Creazione dei giocatori con password hashate
    const players = [
      {
        username: 'Andrea Marini',
        email: 'andrea@gmail.com',
        ...hashPassword('password1'), // Hash della password con salt
        tokens: 0.3,
        role: 'user',
        score: 10,
        //createdAt: new Date(),
        //updatedAt: new Date()
      },
      {
        username: 'Alessio Capriotti',
        email: 'alessio@gmail.com',
        ...hashPassword('password2'), // Hash della password con salt
        tokens: 3,
        role: 'user',
        score: 7,
        //createdAt: new Date(),
        //updatedAt: new Date()
      },
      {
        username: 'Admin Admin',
        email: 'admin@gmail.com',
        ...hashPassword('adminpassword'), // Hash della password con salt
        tokens: 200,
        role: 'admin',
        score: 2,
        //createdAt: new Date(),
        //updatedAt: new Date()
      }, {
        username: 'Prova Prova',
        email: 'prova@gmail.com',
        ...hashPassword('password3'), // Hash della password con salt
        tokens: 3,
        role: 'user',
        score: 7,
        //createdAt: new Date(),
        //updatedAt: new Date()
      }
    ];
    // Inserimento dei dati nella tabella Player
    await queryInterface.bulkInsert('Player', players, {});
  },

  /**
   * Rimuove tutti i dati dalla tabella 'Player'.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento dell'operazione di eliminazione.
   */

  async down(queryInterface, Sequelize) {
    // Eliminazione di tutti i record dalla tabella Player
    await queryInterface.bulkDelete('Player', null, {});
  }
};

/**
 * Genera un hash della password con un salt univoco utilizzando l'algoritmo PBKDF2.
 *
 * @param {string} password - La password da hashare.
 * @param {string} [salt] - Il salt utilizzato per l'hashing. Se non viene fornito, ne viene generato uno nuovo.
 * @returns {{ salt: string, password_hash: string }} Un oggetto contenente il salt e l'hash della password.
 */

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return { salt, password_hash: hash };
}