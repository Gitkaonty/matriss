'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rubriquesexternesmatrices', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      id_rubrique: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 0
      },
      id_etat: {
        type: Sequelize.STRING(25),
        allowNull: false,
        defaultValue: 0
      },
      libelle: {
        type: Sequelize.STRING(250),
        allowNull: false,
        defaultValue: 0
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 0
      },
      ordre: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      subtable: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      par_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rubriquesexternesmatrices');
  }
};
