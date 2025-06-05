'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('liassebhiapcs', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        autoIncrement:true,
        primaryKey:true
        },
        id_compte: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        id_dossier: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_exercice: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_etat: {
            type: Sequelize.STRING(25),
            allowNull: false,
            defaultValue:0
        },
        id_rubrique: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        libelle: {
            type: Sequelize.STRING(150),
            allowNull: true,
        },
        nif: {
            type: Sequelize.STRING(25),
            allowNull: true,
        },
        raison_sociale: {
            type: Sequelize.STRING(250),
            allowNull: true,
        },
        adresse: {
            type: Sequelize.STRING(250),
            allowNull: true,
        },
        montant_charge: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montant_beneficiaire: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        compte: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        nature: {
            type: Sequelize.STRING(15),
            allowNull: true,
        },
        ordre: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0
        },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('liassebhiapcs');
  }
};
