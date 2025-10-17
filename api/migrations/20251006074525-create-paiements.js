'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('paiements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      compte: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      date_payement: {
        type: Sequelize.DATE,
        allowNull: true
      },
      mode_payement: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      montant_paye: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      periode_date_debut: {
        type: Sequelize.DATE,
        allowNull: true
      },
      periode_date_fin: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.dropTable('paiements');
  }
};
