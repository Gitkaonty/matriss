'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('dossier_revision_synthese', 'compte_associe', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('dossier_revision_synthese', 'compte_associe', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  }
};
