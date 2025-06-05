'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('dossierPlanComptables', {
      id_dossier: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        id_compte: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        id_user: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        compte: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        libelle: {
            type: Sequelize.STRING(150),
            allowNull: true
        },
        nature: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        baseaux: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        cptcharge: {
            type: Sequelize.BIGINT,
            allowNull: true,
            defaultValue:0
        },
        cpttva: {
            type: Sequelize.BIGINT,
            allowNull: true,
            defaultValue:0
        },
        nif: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        statistique: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        adresse: {
            type: Sequelize.STRING(200),
            allowNull: true
        },
        motcle: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        cin: {
            type: Sequelize.STRING(15),
            allowNull: true
        },
        datecin: {
            type: Sequelize.DATE,
            allowNull: true
        },
        autrepieceid: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        refpieceid: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        adressesansnif: {
            type: Sequelize.STRING(150),
            allowNull: true
        },
        nifrepresentant: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        adresseetranger: {
            type: Sequelize.STRING(150),
            allowNull: true
        },
        pays: {
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
        rubriquebilan: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        rubriquecrn: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        rubriquecrf: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        rubriquetftd: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        rubriquetfti: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        rubriqueevcp: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        baseaux_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue:0
        },
    },
    {timestamps: true}
   );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('dossierPlanComptables');
  }
};
