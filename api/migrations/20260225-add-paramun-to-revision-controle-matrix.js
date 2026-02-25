'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('revisions_controles_matrices', 'paramUn', {
      type: Sequelize.BIGINT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('revisions_controles_matrices', 'paramUn');
  }
};
