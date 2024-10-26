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

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Move', null, {});
  }
};
