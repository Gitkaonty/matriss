'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dossiers', {
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
      id_portefeuille: {
        type: Sequelize.ARRAY(Sequelize.BIGINT),
        allowNull: true
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      dossier: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      nif: {
        type: Sequelize.STRING(25),
        unique: true,
        allowNull: false
      },
      stat: {
        type: Sequelize.STRING(25),
        unique: true,
        allowNull: false
      },
      responsable: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      expertcomptable: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      centrefisc: {
        type: Sequelize.ENUM('DGE', 'CFISC'),
        allowNull: true,
        comment: "Type de centre fiscal: 'DGE' ou 'CFISC'"
      },
      cac: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      denomination: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      raisonsociale: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      rcs: {
        type: Sequelize.STRING(35),
        allowNull: true
      },
      formejuridique: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      activite: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      detailactivite: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      adresse: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      telephone: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      district: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      commune: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      id_plancomptable: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      longcomptestd: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      longcompteaux: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      autocompletion: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      avecanalytique: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      tauxir: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      pourcentageca: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      montantmin: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      assujettitva: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      capital: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      nbrpart: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      valeurpart: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      compteisi: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      immo_amort_base_jours: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 365
      },
      typecomptabilite: {
        type: Sequelize.STRING(20),
        defaultValue: 'Français',
        allowNull: true
      },
      consolidation: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      pays: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      avecmotdepasse: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      motdepasse: {
        type: Sequelize.STRING(255),
        allowNull: true
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
    await queryInterface.addIndex('dossiers', ['id_compte']);
    await queryInterface.addIndex('dossiers', ['nif']);
    await queryInterface.addIndex('dossiers', ['stat']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('dossiers');
  }
};
