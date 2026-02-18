'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('table_controle_anomalies', 'valide', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    } catch (e) { /* ignore if exists */ }

    try {
      await queryInterface.addColumn('table_controle_anomalies', 'commentaire', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    } catch (e) { /* ignore if exists */ }

    try {
      await queryInterface.addColumn('table_controle_anomalies', 'id_periode', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    } catch (e) { /* ignore if exists */ }
  },

  async down(queryInterface) {
    try { await queryInterface.removeColumn('table_controle_anomalies', 'valide'); } catch (e) { /* noop */ }
    try { await queryInterface.removeColumn('table_controle_anomalies', 'commentaire'); } catch (e) { /* noop */ }
    try { await queryInterface.removeColumn('table_controle_anomalies', 'id_periode'); } catch (e) { /* noop */ }
  }
};
