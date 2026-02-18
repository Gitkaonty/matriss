'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('table_revisions_controles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_compte: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_dossier: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_exercice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_revision: {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, // ✅ ACCOLADE MANQUANTE ICI

      id_controle: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      Type: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      compte: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      test: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      anomalies: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      Valider: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      Commentaire: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Ajout de la colonne id_revision_controle dans la table journals
    await queryInterface.addColumn('journals', 'id_revision_controle', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('journals', 'id_revision_controle');
    await queryInterface.dropTable('table_revisions_controles');
  },
};