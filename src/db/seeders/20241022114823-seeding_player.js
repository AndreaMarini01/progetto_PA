'use strict';

// Libreria nativa di node per l'hash della password
const crypto = require('crypto');

/**
 * Genera un hash della password utilizzando l'algoritmo PBKDF2.
 * @param {string} password - La password in chiaro da hashare.
 * @param {string} salt - Il sale utilizzato per l'hashing.
 * @returns {Object} - Un oggetto contenente il sale e l'hash della password.
 */
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return { salt, hash };
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Creazione dei giocatori con password hashate
    const players = [
      {
        username: 'Andrea Marini',
        email: 'andrea@gmail.com',
        ...hashPassword('password1'), // Hash della password
        tokens: 5,
        role: 'user',
        score: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'Alessio Capriotti',
        email: 'alessio@gmail.com',
        ...hashPassword('password2'), // Hash della password
        tokens: 3,
        role: 'user',
        score: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'Admin Admin',
        email: 'admin@gmail.com',
        ...hashPassword('adminpassword'), // Hash della password
        tokens: 200,
        role: 'admin',
        score: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Inserimento dei dati nella tabella Player
    await queryInterface.bulkInsert('Player', players, {});
  },

  async down(queryInterface, Sequelize) {
    // Eliminazione di tutti i record dalla tabella Player
    await queryInterface.bulkDelete('Player', null, {});
  }
};
