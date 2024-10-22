'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const games = [
      {
        id_game: 1,
        status: 'Ongoing',
        created_at: new Date(),
        ended_at: null,
        type: 'PvP',
        ai_difficulty: null,
        updatedAt: new Date()
      },
      {
        id_game: 2,
        status: 'Completed',
        created_at: new Date(Date.now() - 3600 * 1000), // 1 ora fa
        ended_at: new Date(),
        type: 'PvAI',
        ai_difficulty: 'Hard',
        updatedAt: new Date()
      },
      {
        id_game: 3,
        status: 'Timed Out',
        created_at: new Date(Date.now() - 7200 * 1000), // 2 ore fa
        ended_at: new Date(),
        type: 'PvAI',
        ai_difficulty: 'Easy',
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Game', games, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Game', null, {});
  }
};
