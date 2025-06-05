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
      type: DataTypes.STRING(150),
      unique: false,
      allowNull: true
    },
    raisonsociale: {
    type: DataTypes.STRING(150),
    unique: false,
    allowNull: true
    },
    rcs: {
    type: DataTypes.STRING(35),
    unique: false,
    allowNull: true
    },
    formejuridique: {
        type: DataTypes.STRING(10),
        unique: false,
        allowNull: true
    },
    activite: {
        type: DataTypes.STRING(150),
        unique: false,
        allowNull: true
    },
    detailactivite: {
        type: DataTypes.STRING(250),
        unique: false,
        allowNull: true
    },
    adresse: {
        type: DataTypes.STRING(200),
        unique: false,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(150),
        unique: false,
        allowNull: true
    },
    telephone: {
        type: DataTypes.STRING(15),
        unique: false,
        allowNull: true
    },
    id_plancomptable: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: true
    },
    longcomptestd: {
        type: DataTypes.INTEGER,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
    longcompteaux: {
        type: DataTypes.INTEGER,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
    autocompletion: {
        type: DataTypes.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue:true
    },
    avecanalytique: {
        type: DataTypes.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue:false
    },
    tauxir: {
        type: DataTypes.INTEGER,
        unique: false,
        allowNull: false,
         autocompletion: {
        type: DataTypes.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue:true
    },
    },
    assujettitva: {
        type: DataTypes.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue:false
    },
    capital: {
        type: DataTypes.DOUBLE,
        unique: false,
        allowNull: false,
        defaultValue:0
    },
    nbrpart: {
        type: DataTypes.INTEGER,
        unique: false,
        allowNull: false,
        autocompletion: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue:true
        },
    },
    valeurpart: {
        type: DataTypes.DOUBLE,
        unique: false,
        allowNull: false,
        autocompletion: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue:true
        },
    },
  },
  {timestamps: true}
  );
},

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('dossiers');
  }
};
