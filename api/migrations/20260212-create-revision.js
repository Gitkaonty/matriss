'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('revisions', {
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
      Type: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      Description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      NbrAnomalies: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      Status: {
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('revisions');
  }
};
