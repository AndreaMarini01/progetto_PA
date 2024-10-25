'use strict';

const crypto = require('crypto');

//import {hashPassword} from 'src/utils/cryptoUtils'; // Importa la funzione hashPassword da utils
// const { hashPassword } = require('../../utils/cryptoUtils');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Creazione dei giocatori con password hashate
    const players = [
      {
        username: 'Andrea Marini',
        email: 'andrea@gmail.com',
        ...hashPassword('password1'), // Hash della password con salt
        tokens: 0.3,
        role: 'user',
        score: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'Alessio Capriotti',
        email: 'alessio@gmail.com',
        ...hashPassword('password2'), // Hash della password con salt
        tokens: 3,
        role: 'user',
        score: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'Admin Admin',
        email: 'admin@gmail.com',
        ...hashPassword('adminpassword'), // Hash della password con salt
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

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return { salt, password_hash: hash };
}