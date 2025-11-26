'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ajustementexternesanalytiques', {
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
        references: {
          model: 'exercices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_etat: {
        type: Sequelize.STRING(25),
        unique: false,
        allowNull: true
      },
      nature: {
        type: Sequelize.STRING(25),
        unique: false,
        allowNull: true
      },
      motif: {
        type: Sequelize.STRING(50),
        unique: false,
        allowNull: true
      },
      montant: {
        type: Sequelize.DOUBLE,
        unique: false,
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
    },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ajustementexternesanalytiques');
  }
};
