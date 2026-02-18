'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // id_jnl peut contenir soit journals.id (ligne) soit journals.id_ecriture (ecriture)
    await queryInterface.changeColumn('table_controle_anomalies', 'id_jnl', {
      type: Sequelize.STRING(25),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('table_controle_anomalies', 'id_jnl', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
