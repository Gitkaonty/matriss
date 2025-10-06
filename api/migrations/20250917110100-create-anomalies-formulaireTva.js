'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('anomalies_formulaire_tva', {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
        id_dossier: { type: Sequelize.BIGINT, allowNull: false },
        id_compte: { type: Sequelize.BIGINT, allowNull: false },
        id_exercice: { type: Sequelize.BIGINT, allowNull: false },
        mois: { type: Sequelize.SMALLINT, allowNull: true },
        annee: { type: Sequelize.SMALLINT, allowNull: true },

        code: { type: Sequelize.INTEGER, allowNull: false },
        groupe: { type: Sequelize.STRING(10), allowNull: true },
        kind: { type: Sequelize.STRING(20), allowNull: true },

        expected: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
        actual: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },
        diff: { type: Sequelize.DECIMAL(18,2), allowNull: false, defaultValue: 0 },

        message: { type: Sequelize.TEXT, allowNull: true },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });
    } catch (e) {
      // ignore if table already exists
    }

    // Create indexes if they do not already exist
    const schema = undefined; // default schema
    const table = 'anomalies_formulaire_tva';
    const idxCtxName = 'idx_anomalies_formulaire_tva_ctx';
    const idxCodeName = 'idx_anomalies_formulaire_tva_code';

    // Use raw SQL to leverage IF NOT EXISTS (Postgres)
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS "${idxCtxName}" ON "${table}" ("id_dossier", "id_compte", "id_exercice", "annee", "mois")`
    );
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS "${idxCodeName}" ON "${table}" ("code")`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('anomalies_formulaire_tva');
  }
};
