// Migration Sequelize pour la table historique déclaration
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('historique_declaration', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // Compte utilisateur ayant exporté
      idCompte: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID du compte utilisateur lié à l\'export'
      },
      // Dossier concerné par l\'export
      idDossier: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID du dossier concerné par l\'export'
      },
      declaration: {
        type: Sequelize.STRING(16),
        allowNull: false
      },
      designation: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      date_export: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
    await queryInterface.dropTable('historique_declaration');
  }
};
