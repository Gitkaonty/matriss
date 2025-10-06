'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add commentaire and valide columns if not exists
    try {
      await queryInterface.addColumn('anomalies_formulaire_tva', 'commentaire', { type: Sequelize.TEXT, allowNull: true });
    } catch (e) { /* ignore if exists */ }
    try {
      await queryInterface.addColumn('anomalies_formulaire_tva', 'valide', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    } catch (e) { /* ignore if exists */ }
  },

  async down(queryInterface, Sequelize) {
    try { await queryInterface.removeColumn('anomalies_formulaire_tva', 'commentaire'); } catch (e) { /* noop */ }
    try { await queryInterface.removeColumn('anomalies_formulaire_tva', 'valide'); } catch (e) { /* noop */ }
  }
};
