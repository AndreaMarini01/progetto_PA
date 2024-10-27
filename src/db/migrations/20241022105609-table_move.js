'use strict';

/**
 * Migrazione per creare la tabella 'Move'.
 *
 * Questa migrazione definisce la struttura della tabella 'Move', che rappresenta una mossa in una partita.
 * Include riferimenti alla tabella 'Game' e 'Player', oltre a dettagli sulla mossa come la configurazione
 * della scacchiera, il tipo di pezzo mosso, e le posizioni di partenza e destinazione. Fornisce anche un
 * metodo di rollback per eliminare la tabella se necessario.
 *
 * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
 * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
 */

module.exports = {

  /**
   * Esegue la migrazione per creare la tabella 'Move' con le colonne specificate.
   *
   * - `id_move`: Chiave primaria incrementale per identificare la mossa.
   * - `game_id`: ID della partita a cui appartiene la mossa, con riferimento alla tabella 'Game'.
   * - `user_id`: ID del giocatore che ha effettuato la mossa, con riferimento alla tabella 'Player' (può essere null).
   * - `details`: Dettagli aggiuntivi della mossa, salvati in formato JSON.
   * - `createdAt`: Data e ora di creazione della mossa, impostata di default al momento attuale.
   * - `updatedAt`: Data e ora dell'ultimo aggiornamento della mossa, impostata di default al momento attuale.
   * - `moveNumber`: Numero progressivo della mossa nella partita.
   * - `board`: Configurazione della scacchiera al momento della mossa, salvata in formato JSON.
   * - `pieceType`: Tipo del pezzo mosso (ad esempio "king" o "single").
   * - `fromPosition`: Posizione di partenza della mossa (ad esempio "A7").
   * - `toPosition`: Posizione di destinazione della mossa (ad esempio "E7").
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento della migrazione.
   */

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Move', {
      id_move: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      game_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Game',
          key: 'id_game'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Player',
          key: 'id_player'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true
      },
      details: {
        type: Sequelize.JSON,
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
      },
      moveNumber:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      board: {
        type: Sequelize.JSON, // Campo per memorizzare la configurazione del tabellone
        allowNull: true
      },
      pieceType: {
        type: Sequelize.STRING, // Tipo del pezzo mosso (es. "king" o "single")
        allowNull: true
      },
      fromPosition: {
        type: Sequelize.STRING, // Posizione di partenza (es. "A7")
        allowNull: false
      },
      toPosition: {
        type: Sequelize.STRING, // Posizione di destinazione (es. "E7")
        allowNull: false
      }
    });
  },

  /**
   * Esegue il rollback della migrazione eliminando la tabella 'Move'.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento dell'operazione di rollback.
   */

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Move');
  }
};

