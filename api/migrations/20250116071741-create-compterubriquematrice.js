'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('compterubriquesmatrices', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        autoIncrement:true,
        primaryKey:true
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
      compte: {
          type: Sequelize.STRING(30),
          allowNull: true,
      },
      nature: {
          type: Sequelize.STRING(20),
          allowNull: true,
      },
      senscalcul: {
          type: Sequelize.STRING(10),
          allowNull: true,
      },
      condition: {
          type: Sequelize.STRING(10),
          allowNull: true,
      },
      equation: {
          type: Sequelize.STRING(20),
          allowNull: true,
      },
      par_default: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue:true
      },
      active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue:true
      },
      exercice: {
          type: Sequelize.STRING(5),
          allowNull: true,
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('compterubriquesmatrices');
  }
};
