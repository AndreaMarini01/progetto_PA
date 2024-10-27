'use strict';

/**
 * Seeder per l'inserimento di mosse iniziali nella tabella 'Move'.
 *
 * Questo seeder inserisce una serie di mosse nella tabella 'Move', con dettagli sulla partita,
 * il giocatore, la posizione di partenza e di destinazione, il tipo di pezzo mosso, e la
 * configurazione della tavola al momento della mossa. Utilizza serializzazioni JSON per i dettagli
 * e la configurazione della tavola.
 *
 * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
 * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
 */

module.exports = {

  /**
   * Inserisce dati iniziali nella tabella 'Move', creando diverse mosse per vari giochi.
   *
   * - `game_id`: ID della partita a cui appartiene la mossa.
   * - `user_id`: ID del giocatore che ha effettuato la mossa.
   * - `details`: Dettagli della mossa in formato JSON, inclusi `from` e `to`.
   * - `createdAt` e `updatedAt`: Timestamp di creazione e aggiornamento della mossa.
   * - `moveNumber`: Numero della mossa nella sequenza della partita.
   * - `fromPosition`: Posizione di partenza della mossa.
   * - `toPosition`: Posizione di destinazione della mossa.
   * - `pieceType`: Tipo di pezzo mosso (ad esempio "single" o "king").
   * - `board`: Configurazione della tavola al momento della mossa, serializzata come JSON.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento dell'operazione di inserimento.
   */

  async up(queryInterface, Sequelize) {
    const board = [
      [null, "B", null, "B", null, "B", null, "B"],
      ["B", null, "B", null, "B", null, "B", null],
      [null, "B", null, "B", null, "B", null, "B"],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ["W", null, "W", null, "W", null, "W", null],
      [null, "W", null, "W", null, "W", null, "W"],
      ["W", null, "W", null, "W", null, "W", null]
    ]
    const moves = [
      {
        game_id: 1,
        user_id: 1,
        details: JSON.stringify({ from: 'E2', to: 'E4' }), // Serializza l'oggetto JSON
        createdAt: new Date(),
        updatedAt: new Date(),
        moveNumber: 1,
        fromPosition: 'E2',
        toPosition: 'E4',
        pieceType: 'single',
        board: JSON.stringify({ initialBoard: board })
      },
      {
        game_id: 1,
        user_id: 2,
        details: JSON.stringify({ from: 'D7', to: 'D5' }), // Serializza l'oggetto JSON
        createdAt: new Date(),
        updatedAt: new Date(),
        moveNumber: 1,
        fromPosition: 'E2',
        toPosition: 'E4',
        pieceType: 'single',
        board: JSON.stringify({ initialBoard: board })
      },
      {
        game_id: 2,
        user_id: 1,
        details: JSON.stringify({ from: 'C3', to: 'C5', capture: 'D4' }), // Serializza l'oggetto JSON
        createdAt: new Date(),
        updatedAt: new Date(),
        moveNumber: 1,
        fromPosition: 'E2',
        toPosition: 'E4',
        pieceType: 'single',
        board: JSON.stringify({ initialBoard: board })
      }
    ];
    await queryInterface.bulkInsert('Move', moves, {});
  },

  /**
   * Rimuove tutti i dati dalla tabella 'Move'.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento dell'operazione di eliminazione.
   */

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Move', null, {});
  }
};
