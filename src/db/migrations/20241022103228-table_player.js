'use strict';

/**
 * Migrazione per creare la tabella 'Player'.
 *
 * Questa migrazione crea la tabella 'Player' con le colonne specificate, inclusi
 * campi per l'ID del giocatore, nome utente, email, hash della password, salt,
 * token, ruolo, punteggio, e timestamp di creazione e aggiornamento. Fornisce
 * anche un metodo di rollback per rimuovere la tabella in caso di necessità.
 *
 * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
 * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
 */

module.exports = {

  /**
   * Esegue la migrazione per creare la tabella 'Player' con le colonne specificate.
   *
   * - `id_player`: Chiave primaria incrementale per identificare il giocatore.
   * - `username`: Nome utente unico del giocatore.
   * - `email`: Email unica del giocatore.
   * - `password_hash`: Hash della password per l'autenticazione sicura.
   * - `salt`: Valore di salt utilizzato per l'hash della password.
   * - `tokens`: Numero di token associati al giocatore, con valore predefinito pari a 0.
   * - `role`: Ruolo del giocatore, può essere 'user' o 'admin', con valore predefinito 'user'.
   * - `score`: Punteggio del giocatore.
   * - `createdAt`: Data e ora di creazione del record, impostata di default al momento attuale.
   * - `updatedAt`: Data e ora dell'ultimo aggiornamento del record, impostata di default al momento attuale.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento della migrazione.
   */

  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Player', {
      id_player: {
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  /**
   * Esegue il rollback della migrazione eliminando la tabella 'Player'.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento dell'operazione di rollback.
   */

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Player');
  }
};
