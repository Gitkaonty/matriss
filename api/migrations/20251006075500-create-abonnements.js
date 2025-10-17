'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('abonnements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      compte_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
        references: {
          model: 'userscomptes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date_debut: {
        type: Sequelize.DATE,
        allowNull: true
      },
      date_fin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      exprire: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('abonnements');
  }
};
