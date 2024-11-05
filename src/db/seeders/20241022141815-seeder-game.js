/**
 * Seeder per l'inserimento di partite di esempio nella tabella `Game`.
 *
 * @param {object} queryInterface - L'interfaccia utilizzata per eseguire le query nel database.
 * @param {object} Sequelize - L'istanza di Sequelize che fornisce i tipi di dati per i campi della tabella.
 *
 * @function up
 * Inserisce un insieme di partite di esempio nella tabella `Game` con i seguenti campi:
 *   - `player_id` (INTEGER) - ID del giocatore che ha iniziato la partita.
 *   - `opponent_id` (INTEGER) - ID dell'avversario; se '-1' indica una partita contro l'IA.
 *   - `status` (ENUM) - Stato della partita: 'ongoing', 'timed out', 'completed', 'abandoned'.
 *   - `created_at` (DATE) - Data di creazione casuale generata dalla funzione `getRandomDate`.
 *   - `ended_at` (DATE | opzionale) - Data di fine della partita, può essere `null`.
 *   - `type` (ENUM) - Tipo di partita: 'pvp' (Player vs Player) o 'pve' (Player vs Environment).
 *   - `ai_difficulty` (ENUM) - Difficoltà dell'IA per partite PvE, come 'absent', 'easy' o 'hard'.
 *   - `winner_id` (INTEGER | opzionale) - ID del vincitore, `null` se la partita è ancora in corso.
 *   - `board` (JSON) - Configurazione della board 8x8 serializzata in JSON.
 *   - `total_moves` (INTEGER) - Numero totale di mosse inizialmente impostato a `0`.
 *
 * La funzione `generateBoardConfig` genera una configurazione predefinita della board 8x8. Il campo `board` viene serializzato per essere inserito come JSON nel database.
 *
 * @function down
 * Elimina tutti i record dalla tabella `Game`.
 */

'use strict';

const {readFileSync} = require("fs");

/**
 * Funzione di utilità per generare una data casuale tra sei mesi fa e il momento attuale.
 *
 * @returns {Date} Un oggetto `Date` con un timestamp casuale.
 */

function getRandomDate() {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  // Ottieni il timestamp casuale tra sei mesi fa e ora
  const randomTimestamp = Math.random() * (now.getTime() - sixMonthsAgo.getTime()) + sixMonthsAgo.getTime();
  return new Date(randomTimestamp);
}

module.exports = {
  // Inserimento di partite nella tabella Game
  async up(queryInterface, Sequelize) {
    // Ottenimento della board iniziale dal file initialBoard.json
    const initialBoardPath = 'src/initialBoard.json';
    const initialBoardParsing = JSON.parse(readFileSync(initialBoardPath, 'utf8'));
    const initialBoard = JSON.stringify(initialBoardParsing, null, 2);
    const games = [
      {
        player_id: 1,
        opponent_id: 2,
        status: 'ongoing',
        created_at: getRandomDate(),
        ended_at: null,
        type: 'pvp',
        ai_difficulty: 'absent',
        winner_id: null,
        board: initialBoard,
        total_moves:0
      },
      {
        player_id: 3,
        opponent_id: -1,
        status: 'timed out',
        created_at: getRandomDate(),
        ended_at: new Date(),
        type: 'pve',
        ai_difficulty: 'hard',
        winner_id: 3,
        board: initialBoard,
        total_moves:0
      }
    ];
    await queryInterface.bulkInsert('Game', games, {});
  },
  // Eliminazione dei record dalla tabella Game
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Game', null, {});
  }
};