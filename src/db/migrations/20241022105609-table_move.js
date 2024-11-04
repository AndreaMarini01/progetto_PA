/**
 * Migrazione per la creazione della tabella `Move`.
 *
 * @param {object} queryInterface - L'interfaccia utilizzata per eseguire le query nel database.
 * @param {object} Sequelize - L'istanza di Sequelize che fornisce i tipi di dati per i campi della tabella.
 *
 * @function up
 * Crea la tabella `Move` con i seguenti campi:
 *   - `move_id` (INTEGER) - Chiave primaria autoincrementante, non nulla.
 *   - `game_id` (INTEGER) - Chiave esterna riferita a `Game`, con aggiornamento e cancellazione a cascata, non nulla.
 *   - `user_id` (INTEGER) - Chiave esterna riferita a `Player`, con aggiornamento e cancellazione a cascata.
 *   - `created_at` (DATE) - Data di creazione della mossa, non nulla, con valore predefinito `Sequelize.NOW`.
 *   - `move_number` (INTEGER) - Numero progressivo della mossa all'interno della partita, non nullo.
 *   - `board` (JSON) - Stato della board dopo la mossa, può essere nullo.
 *   - `piece_type` (STRING) - Tipo di pezzo mosso (facoltativo), può essere nullo.
 *   - `from_position` (STRING) - Posizione di partenza della mossa, non nulla.
 *   - `to_position` (STRING) - Posizione di destinazione della mossa, non nulla.
 *
 * Le chiavi esterne `game_id` e `user_id` sono configurate per l'aggiornamento (`CASCADE`) e la cancellazione (`CASCADE`) a cascata.
 *
 * @function down
 * Elimina la tabella `Move`.
 */

'use strict';

module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Move', {
      move_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      game_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Game',
          key: 'game_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Player',
          key: 'player_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      move_number:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      board: {
        type: Sequelize.JSON,
        allowNull: true
      },
      piece_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      from_position: {
        type: Sequelize.STRING,
        allowNull: false
      },
      to_position: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Move');
  }
};

