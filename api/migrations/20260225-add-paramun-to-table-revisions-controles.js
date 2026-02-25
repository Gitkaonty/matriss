'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('table_revisions_controles', 'paramUn', {
      type: Sequelize.BIGINT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('table_revisions_controles', 'paramUn');
  }
};
