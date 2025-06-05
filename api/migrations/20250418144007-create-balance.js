'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('balances', {
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
        id_numcompte: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_numcomptecentr: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
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
        mvtdebittreso: {
            type: Sequelize.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        mvtcredittreso: {
            type: Sequelize.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        soldedebittreso: {
            type: Sequelize.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        soldecredittreso: {
            type: Sequelize.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        valeur: {
            type: Sequelize.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        valeurtreso: {
            type: Sequelize.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        rubriquebilanbrut: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        rubriquebilanamort: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        rubriquecrn: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        rubriquecrf: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        rubriquetftd: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        rubriquetfti: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        rubriqueevcp: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        baseaux_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        nature: {
        type: Sequelize.STRING(25),
        unique: false,
        allowNull: true
        },
        senscalculbilan: {
        type: Sequelize.STRING(3),
        unique: false,
        allowNull: true
        },
        senscalculcrn: {
        type: Sequelize.STRING(3),
        unique: false,
        allowNull: true
        },
        senscalculcrf: {
        type: Sequelize.STRING(3),
        unique: false,
        allowNull: true
        },
        senscalcultftd: {
        type: Sequelize.STRING(3),
        unique: false,
        allowNull: true
        },
        senscalcultfti: {
        type: Sequelize.STRING(3),
        unique: false,
        allowNull: true
        },
      }, {timestamps: true}, )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('balances');
  }
};

