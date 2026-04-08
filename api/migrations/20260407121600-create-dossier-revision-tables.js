'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dossier_revision_matrice', {
      cycle: {
        type: Sequelize.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      questionnaire: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        primaryKey: true,
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
    }, { timestamps: true });

    await queryInterface.createTable('dossier_revision', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_code: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_exercice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_periode: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      valider: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      commentaire: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    }, { timestamps: true });

    await queryInterface.addIndex('dossier_revision', ['id_compte', 'id_dossier', 'id_exercice', 'id_periode'], {
      name: 'idx_dossier_revision_context',
    });

    await queryInterface.addIndex('dossier_revision', ['id_code'], {
      name: 'idx_dossier_revision_id_code',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('dossier_revision');
    await queryInterface.dropTable('dossier_revision_matrice');
  },
};
