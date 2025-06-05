'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('liassesdrs', {
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
      n6: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      n5: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      n4: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      n3: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      n2: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      n1: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      exercice: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      solde_imputable: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      solde_non_imputable: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      total: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      niveau: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue:0
      },
      ordre: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue:0
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
    await queryInterface.dropTable('liassesdrs');
  }
};
