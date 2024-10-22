'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const moves = [
      {
        id_move: 1,
        game_id: 1,
        user_id: 1,
        details: JSON.stringify({ from: 'E2', to: 'E4' }), // Serializza l'oggetto JSON
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_move: 2,
        game_id: 1,
        user_id: 2,
        details: JSON.stringify({ from: 'D7', to: 'D5' }), // Serializza l'oggetto JSON
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_move: 3,
        game_id: 2,
        user_id: 1,
        details: JSON.stringify({ from: 'C3', to: 'C5', capture: 'D4' }), // Serializza l'oggetto JSON
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Move', moves, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Move', null, {});
  }
};
