'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('balanceanalytiques', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        autoIncrement: true,
        primaryKey: true
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
      id_numcpt: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'dossierplancomptables',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_axe: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'caaxes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_section: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'casections',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      mvtdebitanalytique: {
        type: Sequelize.DOUBLE,
        unique: false,
        allowNull: true,
        defaultValue: 0
      },
      mvtcreditanalytique: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      soldedebitanalytique: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      soldecreditanalytique: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      valeuranalytique: {
        type: Sequelize.DOUBLE,
        unique: false,
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
    },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('balanceanalytiques');
  }
};
