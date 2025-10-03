'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('localites', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      district: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      commune: {
        type: Sequelize.STRING,
        allowNull: false,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('localites');
  },
};