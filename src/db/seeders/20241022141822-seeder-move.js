/**
 * Migrazione per l'inserimento di mosse di esempio nella tabella `Move`.
 *
 * @param queryInterface - L'interfaccia utilizzata per eseguire le query nel database.
 * @param Sequelize - L'istanza di Sequelize che fornisce i tipi di dati per i campi della tabella.
 *
 * @function up
 * Inserisce un insieme di mosse di esempio nella tabella `Move` con i seguenti campi:
 *   - `game_id` (INTEGER) - ID della partita a cui appartiene la mossa.
 *   - `user_id` (INTEGER) - ID dell'utente che ha effettuato la mossa.
 *   - `createdAt` (DATE) - Timestamp della mossa, impostato a `new Date()` per l'attuale data e ora.
 *   - `move_number` (INTEGER) - Numero progressivo della mossa all'interno della partita.
 *   - `from_position` (STRING) - Posizione di partenza della mossa (es: 'E2').
 *   - `to_position` (STRING) - Posizione di destinazione della mossa (es: 'E4').
 *   - `piece_type` (STRING) - Tipo di pezzo mosso (es: 'single').
 *   - `board` (JSON) - Configurazione della board al momento della mossa, serializzata in JSON.
 *
 * Ogni mossa utilizza una configurazione predefinita della board 8x8.
 *
 * @function down
 * Elimina tutti i record dalla tabella `Move`.
 */

'use strict';

module.exports = {

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
        createdAt: new Date(),
        move_number: 1,
        from_position: 'E2',
        to_position: 'E4',
        piece_type: 'single',
        board: JSON.stringify({ initialBoard: board })
      },
      {
        game_id: 1,
        user_id: 2,
        createdAt: new Date(),
        move_number: 2,
        from_position: 'E2',
        to_position: 'E4',
        piece_type: 'single',
        board: JSON.stringify({ initialBoard: board })
      },
      {
        game_id: 2,
        user_id: 1,
        createdAt: new Date(),
        move_number: 1,
        from_position: 'E2',
        to_position: 'E4',
        piece_type: 'single',
        board: JSON.stringify({ initialBoard: board })
      }
    ];
    await queryInterface.bulkInsert('Move', moves, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Move', null, {});
  }
};
