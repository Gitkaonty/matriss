'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Table dossier_revision_synthese
    await queryInterface.createTable('dossier_revision_synthese', {
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
      cycle: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      progression: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      compte_associe: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_compte: {
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

    // Table dossier_revision_commentaire
    await queryInterface.createTable('dossier_revision_commentaire', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cycle: {
        type: Sequelize.STRING(50),
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

    // Index pour dossier_revision_synthese
    await queryInterface.addIndex('dossier_revision_synthese', 
      ['id_dossier', 'id_compte', 'id_exercice', 'id_periode', 'id_code'], 
      { name: 'idx_dossier_revision_synthese_context' }
    );

    // Index pour dossier_revision_commentaire
    await queryInterface.addIndex('dossier_revision_commentaire', 
      ['id_dossier', 'id_compte', 'id_exercice', 'id_periode', 'id_code', 'cycle'], 
      { name: 'idx_dossier_revision_commentaire_context' }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('dossier_revision_commentaire');
    await queryInterface.dropTable('dossier_revision_synthese');
  },
};
