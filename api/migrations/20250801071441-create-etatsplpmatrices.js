'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('etatsplpmatrices', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        autoIncrement: true,
        primaryKey: true
      },
      code_cn: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      nature_produit: {
        type: Sequelize.STRING(250),
        allowNull: false
      },
      unite_quantite: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '0'
      },
      commercant_quantite: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      commercant_valeur: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      producteur_quantite: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      producteur_valeur: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('etatsplpmatrices');
  }
};
