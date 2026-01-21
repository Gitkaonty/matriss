'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('journals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      id_exercice: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      id_ecriture: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      datesaisie: {
        type: Sequelize.DATE,
        allowNull: true
      },
      dateecriture: {
        type: Sequelize.DATE,
        allowNull: false
      },
      id_journal: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      id_numcpt: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 0
      },
      id_numcptcentralise: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      piece: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      piecedate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      libelle: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      debit: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      credit: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      devise: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      lettrage: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      lettragedate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      saisiepar: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      modifierpar: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      fichier: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      id_devise: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 0
      },
      taux: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      montant_devise: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      id_immob: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      num_facture: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      decltvamois: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      decltvaannee: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      decltva: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      declisimois: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      declisiannee: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      declisi: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      rapprocher: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      date_rapprochement: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajouter des index pour améliorer les performances
    await queryInterface.addIndex('journals', ['id_dossier', 'id_exercice']);
    await queryInterface.addIndex('journals', ['id_ecriture']);
    await queryInterface.addIndex('journals', ['dateecriture']);
    await queryInterface.addIndex('journals', ['id_numcpt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('journals');
  }
};
