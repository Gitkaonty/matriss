'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // id_controle devient STRING pour stocker le code (ex: "SENS_SOLDE0001")
    await queryInterface.changeColumn('table_controle_anomalies', 'id_controle', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('table_controle_anomalies', 'id_controle', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
