'use strict';

/**
 * Genera una data casuale tra l'epoca Unix e il momento attuale.
 *
 * @returns {Date} Un oggetto `Date` casuale.
 */

function getRandomDate() {
  const now = new Date();
  const randomTime = Math.random() * now.getTime(); // Genera un timestamp casuale tra l'epoca Unix e adesso
  return new Date(randomTime);
}

/**
 * Genera una configurazione casuale della tavola di gioco per Draughts.
 *
 * La configurazione include pezzi per due giocatori, con 12 pezzi iniziali
 * per ciascun giocatore posizionati su un tavolo di 32 caselle.
 *
 * @returns {string} La configurazione iniziale della tavola di gioco in formato JSON.
 */

function   generateRandomBoardConfig() {
  const board = Array(32).fill(null); // Crea una tavola 32-caselle per i pezzi scuri (configurazione Draughts)
  // Popola la tavola con i pezzi iniziali per Giocatore 1 e Giocatore 2
  for (let i = 0; i < 12; i++) {
    board[i] = { dark: true, position: i, piece: { player: 'dark', king: false } }; // Giocatore 1
  }
  for (let i = 20; i < 32; i++) {
    board[i] = { dark: true, position: i, piece: { player: 'light', king: false } }; // Giocatore 2
  }
  return JSON.stringify({ initialBoard: board });
}

/**
 * Seeder per l'inserimento di dati iniziali nella tabella 'Game'.
 *
 * Questo seeder inserisce una serie di partite nella tabella 'Game', con diverse configurazioni
 * di stato, tipo di gioco e difficoltà dell'IA. Utilizza funzioni per generare date casuali e
 * configurazioni iniziali della tavola di gioco.
 *
 * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
 * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
 */

module.exports = {

  /**
   * Inserisce dati iniziali nella tabella 'Game', creando diverse partite con configurazioni
   * casuali per stato, tipo e difficoltà dell'IA.
   *
   * - `player_id`: ID del giocatore principale coinvolto nella partita.
   * - `opponent_id`: ID dell'avversario, se presente (null per PvE).
   * - `status`: Stato della partita (In corso, Completata, Scaduta).
   * - `created_at`: Data e ora di creazione della partita.
   * - `ended_at`: Data e ora di conclusione della partita, se applicabile.
   * - `type`: Tipo di partita (PvP o PvE).
   * - `ai_difficulty`: Difficoltà dell'IA (Assente, Facile, Difficile).
   * - `updatedAt`: Data e ora dell'ultimo aggiornamento della partita.
   * - `date`: Data casuale associata alla partita.
   * - `board`: Configurazione iniziale della tavola di gioco in formato JSON.
   * - `total_moves`: Numero totale di mosse effettuate nella partita.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento dell'operazione di inserimento.
   */

  async up(queryInterface, Sequelize) {
    const games = [
      {
        player_id: 1,
        opponent_id: 2,
        status: 'Ongoing',
        created_at: new Date(),
        ended_at: null,
        type: 'PvP',
        ai_difficulty: 'Absent',
        updatedAt: new Date(),
        date: getRandomDate(),
        board: generateRandomBoardConfig(),
        total_moves:0
      },
      {
        status: 'Ongoing',
        player_id: 1,
        opponent_id: null,
        created_at: new Date(Date.now() - 3600 * 1000), // 1 ora fa
        ended_at: new Date(),
        type: 'PvE',
        ai_difficulty: 'Hard',
        updatedAt: new Date(),
        date: getRandomDate(),
        board: generateRandomBoardConfig(),
        total_moves:0
      },
      {
        player_id: 2,
        opponent_id: null,
        status: 'Timed Out',
        created_at: new Date(Date.now() - 7200 * 1000), // 2 ore fa
        ended_at: new Date(),
        type: 'PvE',
        ai_difficulty: 'Easy',
        updatedAt: new Date(),
        date: getRandomDate(),
        board: generateRandomBoardConfig(),
        total_moves:0
      }
    ];
    await queryInterface.bulkInsert('Game', games, {});
  },

  /**
   * Rimuove tutti i dati dalla tabella 'Game'.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - L'interfaccia per eseguire comandi di modifica del database.
   * @param {import('sequelize')} Sequelize - L'oggetto Sequelize che fornisce i tipi di dati.
   * @returns {Promise<void>} Una promessa che rappresenta il completamento dell'operazione di eliminazione.
   */

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Game', null, {});
  }
};
