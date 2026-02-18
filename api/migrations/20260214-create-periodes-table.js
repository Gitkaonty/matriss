'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('periodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_exercice: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      libelle: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      date_debut: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      date_fin: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      rang: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('periodes', ['id_exercice']);
    await queryInterface.addIndex('periodes', ['id_compte', 'id_dossier', 'id_exercice']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('periodes');
  },
};
