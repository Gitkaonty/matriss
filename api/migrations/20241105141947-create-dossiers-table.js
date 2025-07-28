'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('dossiers', {
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    id_user: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    dossier: {
        type: Sequelize.STRING(150),
        unique: false,
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
        unique: false,
        allowNull: true
    },
    expertcomptable: {
        type: Sequelize.STRING(150),
        unique: false,
        allowNull: true
    },
    cac: {
        type: Sequelize.STRING(150),
        unique: false,
        allowNull: true
    },
    denomination: {
      type: Sequelize.STRING(150),
      unique: false,
      allowNull: true
    },
    raisonsociale: {
        type: Sequelize.STRING(150),
        unique: false,
        allowNull: true
    },
    rcs: {
        type: Sequelize.STRING(35),
        unique: false,
        allowNull: true
    },
    formejuridique: {
        type: Sequelize.STRING(10),
        unique: false,
        allowNull: true
    },
    activite: {
        type: Sequelize.STRING(150),
        unique: false,
        allowNull: true
    },
    detailactivite: {
        type: Sequelize.STRING(250),
        unique: false,
        allowNull: true
    },
    adresse: {
        type: Sequelize.STRING(200),
        unique: false,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING(150),
        unique: false,
        allowNull: true
    },
    telephone: {
        type: Sequelize.STRING(15),
        unique: false,
        allowNull: true
    },
    id_plancomptable: {
        type: Sequelize.BIGINT,
        unique: false,
        allowNull: true
    },
    longcomptestd: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
    longcompteaux: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
    autocompletion: {
        type: Sequelize.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue:true
    },
    avecanalytique: {
        type: Sequelize.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue:false
    },
     autocompletion: {
        type: Sequelize.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue:true
    },
    tauxir: {
        type: Sequelize.DOUBLE,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
    pourcentageca: {
        type: Sequelize.DOUBLE,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
    montantmin: {
        type: Sequelize.DOUBLE,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
    assujettitva: {
        type: Sequelize.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue:false
    },
    capital: {
        type: Sequelize.DOUBLE,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
    nbrpart: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
    valeurpart: {
        type: Sequelize.DOUBLE,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
  },
  {timestamps: true}
  );
},

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('dossiers');
  }
};
