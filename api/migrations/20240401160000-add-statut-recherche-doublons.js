'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter la colonne statut dans recherche_doublons
    await queryInterface.addColumn('recherche_doublons', 'statut', {
      type: Sequelize.ENUM('VALIDE', 'NON_VALIDE'),
      defaultValue: 'NON_VALIDE',
      allowNull: true
    });

    // Ajouter la colonne date_validation
    await queryInterface.addColumn('recherche_doublons', 'date_validation', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('recherche_doublons', 'statut');
    await queryInterface.removeColumn('recherche_doublons', 'date_validation');
  }
};
