'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('exercices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      date_debut: {
        type: Sequelize.DATE,
        allowNull: false
      },
      date_fin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      libelle_rang: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      rang: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      cloture: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajouter des index pour améliorer les performances
    await queryInterface.addIndex('exercices', ['id_dossier']);
    await queryInterface.addIndex('exercices', ['date_debut', 'date_fin']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('exercices');
  }
};
