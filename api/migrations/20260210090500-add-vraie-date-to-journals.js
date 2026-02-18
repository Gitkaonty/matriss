'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('journals', 'vraie_date', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addIndex('journals', ['vraie_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('journals', ['vraie_date']);
    await queryInterface.removeColumn('journals', 'vraie_date');
  }
};
