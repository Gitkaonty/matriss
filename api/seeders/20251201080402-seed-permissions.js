'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('permissions', [
      { nom: 'Ajout', code: 'ADD', createdAt: new Date(), updatedAt: new Date() },
      { nom: 'Modification', code: 'EDIT', createdAt: new Date(), updatedAt: new Date() },
      { nom: 'Suppression', code: 'DELETE', createdAt: new Date(), updatedAt: new Date() },
      { nom: 'Visualisation', code: 'VIEW', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
