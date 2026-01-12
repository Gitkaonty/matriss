'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('codejournals', 'taux_tva', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('codejournals', 'taux_tva');
  }
};
