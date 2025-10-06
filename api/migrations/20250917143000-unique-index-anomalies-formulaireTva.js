'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const idxName = 'uq_anom_ctx_code_kind';
    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "${idxName}"
       ON "anomalies_formulaire_tva"
       ("id_dossier", "id_compte", "id_exercice",
        COALESCE("mois", -1), COALESCE("annee", -1),
        "code", "kind")`
    );
  },

  async down(queryInterface, Sequelize) {
    const idxName = 'uq_anom_ctx_code_kind';
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS "${idxName}"`
    );
  }
};
