'use strict';

module.exports = {
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
        allowNull: false
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Move');
  }
};

