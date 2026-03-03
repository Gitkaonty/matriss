'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter colonne id_periode à table_revisions_controles
    await queryInterface.addColumn('table_revisions_controles', 'id_periode', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'ID de la période utilisée pour cette révision'
    });

    // Ajouter index pour optimiser les recherches par période
    await queryInterface.addIndex('table_revisions_controles', ['id_periode']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('table_revisions_controles', ['id_periode']);
    await queryInterface.removeColumn('table_revisions_controles', 'id_periode');
  }
};
