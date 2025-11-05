'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('compterubriqueexternesmatrices', {
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
      tableau: {
        type: Sequelize.STRING(25),
        allowNull: false,
        defaultValue: 0
      },
      compte: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      nature: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      senscalcul: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      condition: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      equation: {
        type: Sequelize.STRING(20),
        allowNull: true,
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
    await queryInterface.dropTable('compterubriqueexternesmatrices');
  }
};
