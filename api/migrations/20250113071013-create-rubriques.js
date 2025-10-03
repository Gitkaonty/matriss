'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rubriques', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        autoIncrement: true,
        primaryKey: true
      },
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      id_exercice: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      id_etat: {
        type: Sequelize.STRING(25),
        allowNull: false,
        defaultValue: 0
      },
      subtable: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      id_rubrique: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      note: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 0
      },
      montantbrut: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      montantamort: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      montantnet: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      montantnetn1: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      nature: {
        type: Sequelize.STRING(15),
        allowNull: false,
        defaultValue: 0
      },
      ordre: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      niveau: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      senscalcul: {
        type: Sequelize.STRING(25),
        allowNull: true,
        defaultValue: ''
      },
    },
      { timestamps: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rubriques');
  }
};
