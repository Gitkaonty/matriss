'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('liassedps', {
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
      type_calcul: {
          type: Sequelize.STRING(10),
          allowNull: true,
      },
      ordre: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue:0
      },
      niveau: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue:0
      },
      nature_prov: {
          type: Sequelize.STRING(100),
          allowNull: true,
      },
      montant_debut_ex: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      augm_dot_ex: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      dim_repr_ex: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      diminution: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      montant_fin: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      compte_associe: {
          type: Sequelize.STRING(50),
          allowNull: true,
      },
      nature: {
        type: Sequelize.STRING(15),
        allowNull: true,
    },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('liassedps');
  }
};
