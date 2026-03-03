'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter colonne id_num_compte à table_controle_anomalies
    await queryInterface.addColumn('table_controle_anomalies', 'id_num_compte', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: null,
      comment: 'Numéro de compte (ex: 401000, 530000) - peut avoir des doublons, c\'est l\'id_jnl qui différencie'
    });

    // Ajouter index pour optimiser les recherches par numéro de compte
    await queryInterface.addIndex('table_controle_anomalies', ['id_num_compte']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('table_controle_anomalies', ['id_num_compte']);
    await queryInterface.removeColumn('table_controle_anomalies', 'id_num_compte');
  }
};