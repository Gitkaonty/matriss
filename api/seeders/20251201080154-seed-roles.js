'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      { code: 3355, nom: 'SuperAdmin', createdAt: new Date(), updatedAt: new Date() },
      { code: 5150, nom: 'Admin', createdAt: new Date(), updatedAt: new Date() },
      { code: 1984, nom: 'User', createdAt: new Date(), updatedAt: new Date() },
      { code: 2001, nom: 'Lector', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
