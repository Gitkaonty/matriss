'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('balancesimportees', {
        id_compte: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
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
        compte: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        libelle: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        mvtdebit: {
            type: Sequelize.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        mvtcredit: {
            type: Sequelize.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        soldedebit: {
            type: Sequelize.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        soldecredit: {
            type: Sequelize.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        }, {timestamps: true}, )
    },

    async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('balancesimportees');
  }
};
