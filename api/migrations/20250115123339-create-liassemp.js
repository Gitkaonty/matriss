'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('liassemps', {
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
      ref_marche: {
          type: Sequelize.STRING(150),
          allowNull: true,
      },
      date: {
          type: Sequelize.DATE,
          allowNull: true,
      },
      date_paiement: {
          type: Sequelize.DATE,
          allowNull: true,
      },
      montant_marche_ht: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      tmp: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      montant_paye: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      marche: {
          type: Sequelize.STRING(250),
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
    await queryInterface.dropTable('liassemps');
  }
};
