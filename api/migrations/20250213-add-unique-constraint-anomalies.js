'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter une contrainte d'unicité sur table_controle_anomalies
    await queryInterface.addConstraint('table_controle_anomalies', {
      fields: ['id_compte', 'id_dossier', 'id_exercice', 'id_jnl', 'id_controle'],
      type: 'unique',
      name: 'unique_anomaly_per_compte_controle'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('table_controle_anomalies', 'unique_anomaly_per_compte_controle');
  }
};
