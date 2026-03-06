'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analyse_fournisseur_lignes', {
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
      id_periode: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_ligne: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      compte: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      code_journal: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      type_journal: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      date_ecriture: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      piece: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      libelle: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      debit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      credit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      lettrage: {
        type: Sequelize.STRING(50),
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

  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint(
    'analyse_fournisseur_lignes',
    );
  }
};
