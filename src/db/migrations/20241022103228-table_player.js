'use strict';

/**
 * Migrazione per la creazione della tabella `Player`.
 *
 * @param queryInterface - L'interfaccia utilizzata per eseguire le query nel database.
 * @param Sequelize - L'istanza di Sequelize che fornisce i tipi di dati per i campi della tabella.
 *
 * @function up
 * Crea la tabella `Player` con i seguenti campi:
 *   - `player_id` (INTEGER) - Chiave primaria autoincrementante, non nulla.
 *   - `username` (STRING) - Nome utente unico, non nullo.
 *   - `email` (STRING) - Email unica, non nulla.
 *   - `password_hash` (STRING) - Hash della password dell'utente, non nullo.
 *   - `salt` (STRING) - Salt utilizzato per la creazione dell'hash della password, non nullo.
 *   - `tokens` (FLOAT) - Numero di token disponibili per l'utente, non nullo, con valore di default pari a 0.
 *   - `role` (ENUM) - Ruolo dell'utente, `user` o `admin`, predefinito a `user`.
 *   - `score` (FLOAT) - Punteggio dell'utente, non nullo.
 *
 * @function down
 * Elimina la tabella `Player`.
 */

module.exports = {

  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Player', {
      player_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      salt: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tokens: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
      },
      score: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Player');
  }
};
