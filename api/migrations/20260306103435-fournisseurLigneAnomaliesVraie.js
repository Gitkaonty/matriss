'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analyse_fournisseur_anomalies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_dossier: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_ligne: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      compte: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      id_periode: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_exercice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      type_anomalie: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Type d\'anomalie: paiement_sans_facture, facture_3mois, ajustement_non_traite, solde_suspens'
      },
      commentaire: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      valider: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      commentaire_validation: {
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
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('analyse_fournisseur_anomalies');
  }
};
