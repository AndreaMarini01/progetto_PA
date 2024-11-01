/**
 * Migrazione per l'inserimento di partite di esempio nella tabella `Game`.
 *
 * @param queryInterface - L'interfaccia utilizzata per eseguire le query nel database.
 * @param Sequelize - L'istanza di Sequelize che fornisce i tipi di dati per i campi della tabella.
 *
 * @function up
 * Inserisce un insieme di partite di esempio nella tabella `Game` con i seguenti campi:
 *   - `player_id` (INTEGER) - ID del giocatore che ha iniziato la partita.
 *   - `opponent_id` (INTEGER | opzionale) - ID dell'avversario, se presente; `null` per una partita contro l'IA.
 *   - `status` (ENUM) - Stato della partita: 'Ongoing', 'Timed Out', ecc.
 *   - `created_at` (DATE) - Data di creazione casuale generata dalla funzione `getRandomDate`.
 *   - `ended_at` (DATE | opzionale) - Data di fine della partita, può essere `null`.
 *   - `type` (ENUM) - Tipo di partita: 'PvP' (Player vs Player) o 'PvE' (Player vs Environment).
 *   - `ai_difficulty` (ENUM | opzionale) - Difficoltà dell'IA per partite PvE, come 'Absent' o 'Hard'.
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
 * Funzione di utilità per generare una data casuale tra l'epoca Unix e il momento attuale.
 *
 * @returns Un oggetto `Date` con un timestamp casuale.
 */

function getRandomDate() {
  const now = new Date();
  const randomTime = Math.random() * now.getTime(); // Genera un timestamp casuale tra l'epoca Unix e adesso
  return new Date(randomTime);
}

module.exports = {

  async up(queryInterface, Sequelize) {
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
        status: 'ongoing',
        player_id: 1,
        opponent_id: -1,
        created_at: getRandomDate(),
        ended_at: new Date(),
        type: 'pve',
        ai_difficulty: 'hard',
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

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Game', null, {});
  }
};