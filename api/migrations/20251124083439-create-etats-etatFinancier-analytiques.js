'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('etatsetatfinancieranalytiques', {
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
      code: {
        type: Sequelize.STRING(15),
        unique: false,
        allowNull: false
      },
      nom: {
        type: Sequelize.STRING(250),
        unique: false,
        allowNull: false
      },
      ordre: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false,
        defaultValue: 0
      },
      valide: {
        type: Sequelize.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('etatsetatfinancieranalytiques');
  }
};
