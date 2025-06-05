'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('liasseses', {
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
      liste_emprunteur: {
          type: Sequelize.STRING(150),
          allowNull: true,
      },
      date_contrat: {
          type: Sequelize.DATE,
          allowNull: true,
      },
      duree_contrat: {
          type: Sequelize.STRING(50),
          allowNull: true,
      },
      montant_emprunt: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      montant_interet: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      montant_total: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      date_disposition: {
          type: Sequelize.DATE,
          allowNull: true,
      },
      montant_rembourse_capital: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      montant_rembourse_interet: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      solde_non_rembourse: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      date_remboursement: {
          type: Sequelize.DATE,
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
    await queryInterface.dropTable('liasseses');
  }
};
