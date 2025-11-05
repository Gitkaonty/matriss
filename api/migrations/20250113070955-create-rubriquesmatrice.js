'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rubriquesmatrices', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        autoIncrement: true,
        primaryKey: true
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
        defaultValue: 0,
        unique: true,
      },
      note: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 0
      },
      libelle: {
        type: Sequelize.STRING(250),
        allowNull: false,
        defaultValue: 0
      },
      senscalcul: {
        type: Sequelize.STRING(25),
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
    },
      { timestamps: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rubriquesmatrices');
  }
};
