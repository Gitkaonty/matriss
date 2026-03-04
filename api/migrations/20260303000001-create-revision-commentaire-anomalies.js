'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('revision_commentaire_anomalies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_compte: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_dossier: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_exercice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_periode: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_anomalie: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Reference à l\'anomalie dans table_controle_anomalies',
      },
      valide: {
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
    });

    // Ajouter un index unique pour éviter les doublons
    await queryInterface.addIndex('revision_commentaire_anomalies', 
      ['id_compte', 'id_dossier', 'id_exercice', 'id_anomalie'], 
      { unique: true, name: 'unique_commentaire_anomalie' }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('revision_commentaire_anomalies');
  },
};
