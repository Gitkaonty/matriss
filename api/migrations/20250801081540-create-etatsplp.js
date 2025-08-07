'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('etatsplps', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'userscomptes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'dossiers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_exercice: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
        references: {
          model: 'exercices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('etatsplps');
  }
};
