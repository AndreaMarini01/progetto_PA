'use strict';

const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Game');
  }
};

