'use strict';

const { readFileSync } = require('fs');
const path = require('path');

/**
 * Migrazione per creare la tabella 'Game'.
 *
 * Questa migrazione crea la tabella 'Game' con le colonne specificate, tra cui ID del gioco, ID del giocatore,
 * ID dell'avversario, stato della partita, date di creazione e fine, tipo di gioco, difficoltà dell'IA,
 * data di aggiornamento, scacchiera, e numero totale di mosse. Include anche un metodo di rollback per
 * rimuovere la tabella in caso di necessità.
 *
 * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
 * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
 */

module.exports = {

  /**
   * Esegue la migrazione per creare la tabella 'Game' con le colonne specificate.
   *
   * - `id_game`: Chiave primaria incrementale per identificare il gioco.
   * - `player_id`: ID del giocatore principale coinvolto nella partita.
   * - `opponent_id`: ID dell'avversario, se presente (null per PvE).
   * - `status`: Stato attuale della partita (In corso, Completata, Abbandonata, Scaduta).
   * - `created_at`: Data e ora di creazione della partita, impostata di default al momento attuale.
   * - `ended_at`: Data e ora di conclusione della partita, se applicabile.
   * - `type`: Tipo di partita (PvP o PvE).
   * - `ai_difficulty`: Livello di difficoltà dell'IA, se applicabile (Assente, Facile, Difficile).
   * - `updatedAt`: Data e ora dell'ultimo aggiornamento del record, impostata di default al momento attuale.
   * - `date`: Data e ora di riferimento per la partita, impostata di default al momento attuale.
   * - `board`: Configurazione della scacchiera, salvata in formato JSON, con valore predefinito dal file `initialBoard.json`.
   * - `total_moves`: Numero totale di mosse eseguite nella partita, inizialmente pari a zero.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento della migrazione.
   */

  up: async (queryInterface, Sequelize) => {
    const initialBoardPath = 'src/initialBoard.json';
    const initialBoard = JSON.parse(readFileSync(initialBoardPath, 'utf8'));

    await queryInterface.createTable('Game', {
      id_game: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      opponent_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      winner_id: {
        type: Sequelize.INTEGER,
        /*
        references: {
          model: 'Player',
          key: 'id_player',
        },*/
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Ongoing', 'Completed', 'Abandoned', 'Timed Out'),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      ended_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('PvP', 'PvE'),
        allowNull: false
      },
      ai_difficulty: {
        type: Sequelize.ENUM('Absent','Easy', 'Hard'),
        allowNull: true
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      board: {
        type: Sequelize.JSON, // Aggiungi questa riga per il campo JSON
        allowNull: false,
        defaultValue: initialBoard
      },
      total_moves:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    });
  },

  /**
   * Esegue il rollback della migrazione eliminando la tabella 'Game'.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento dell'operazione di rollback.
   */

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Game');
  }
};

