'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'dgematrices';
    const column = 'groupe';
    // Add column if not exists
    try {
      await queryInterface.addColumn(table, column, {
        type: Sequelize.STRING(4),
        allowNull: true,
      });
    } catch (e) {
      // If column already exists, ignore
      if (!/already exists/i.test(String(e && e.message))) {
        throw e;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const table = 'dgematrices';
    const column = 'groupe';
    try {
      await queryInterface.removeColumn(table, column);
    } catch (e) {
      if (!/does not exist/i.test(String(e && e.message))) {
        throw e;
      }
    }
  }
};
