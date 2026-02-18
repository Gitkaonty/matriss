'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Ajouter colonne Affichage à table_revisions_controles
    await queryInterface.addColumn('table_revisions_controles', 'Affichage', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'ligne',
    });

    // 2. Ajouter colonne Affichage à revisions_controles_matrices
    await queryInterface.addColumn('revisions_controles_matrices', 'Affichage', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'ligne',
    });

    // 3. Créer la table table_controle_anomalies
    await queryInterface.createTable('table_controle_anomalies', {
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
      id_jnl: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'id auto dans journal (id de l ecriture)',
      },
      codeCtrl: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Type de controle ou id_controle',
      },
      id_controle: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Reference au controle dans table_revisions_controles',
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('table_controle_anomalies');
    await queryInterface.removeColumn('revisions_controles_matrices', 'Affichage');
    await queryInterface.removeColumn('table_revisions_controles', 'Affichage');
  },
};
