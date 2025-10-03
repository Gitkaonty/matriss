'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tva_annexes', {
      id: { type: Sequelize.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },
      collecte_deductible: { type: Sequelize.STRING(50), allowNull: false },
      local_etranger: { type: Sequelize.STRING(50), allowNull: false },
      nif: { type: Sequelize.STRING(50), allowNull: false },
      raison_sociale: { type: Sequelize.STRING(250), allowNull: false },
      stat: { type: Sequelize.STRING(100), allowNull: false },
      adresse: { type: Sequelize.STRING(250), allowNull: false },
      montant_ht: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      montant_tva: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      reference_facture: { type: Sequelize.STRING(140), allowNull: false },
      date_facture: { type: Sequelize.DATEONLY, allowNull: false },
      nature: { type: Sequelize.STRING(120), allowNull: false },
      libelle_operation: { type: Sequelize.STRING(250), allowNull: false },
      date_paiement: { type: Sequelize.DATEONLY, allowNull: false },
      mois: { type: Sequelize.INTEGER, allowNull: false },
      annee: { type: Sequelize.INTEGER, allowNull: false },
      observation: { type: Sequelize.STRING(250), allowNull: false },
      n_dau: { type: Sequelize.STRING(120), allowNull: false },
      ligne_formulaire: { type: Sequelize.STRING(120), allowNull: false },
      anomalies: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      commentaire: { type: Sequelize.TEXT, allowNull: true },
      code_tva: { type: Sequelize.STRING(50), allowNull: true },

      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'userscomptes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'dossiers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_exercice: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'exercices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_ecriture: {
        type: Sequelize.BIGINT,
        unique: true,
        allowNull: false,
      },
      id_numcpt: {
        type: Sequelize.BIGINT,
        references: { model: 'dossierplancomptables', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    // Helpful composite index for scoping and performance
    await queryInterface.addIndex('tva_annexes', ['id_compte', 'id_dossier', 'id_exercice', 'id_ecriture', 'id_numcpt']);
    await queryInterface.addIndex('tva_annexes', ['mois', 'annee']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tva_annexes');
  },
};
