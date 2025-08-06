'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('controlematricedetails', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        autoIncrement:true,
        primaryKey:true
      },
      declaration: {
          type: Sequelize.STRING(20),
          unique: false,
          allowNull: true
      },
      etat_id: {
          type: Sequelize.STRING(20),
          unique: false,
          allowNull: true
      },
      control_id: {
        type: Sequelize.INTEGER,
        unique: false,
        defaultValue:0
      },
      subtable: {
        type: Sequelize.INTEGER,
        unique: false,
        defaultValue:0
      },
      tablename: {
          type: Sequelize.STRING(20),
          unique: false,
          allowNull: true
      },
      tableau: {
        type: Sequelize.STRING(20),
        unique: false,
        allowNull: true
      },
      ligne: {
        type: Sequelize.STRING(20),
        unique: false,
        allowNull: true
      },
      colonnefiltre: {
        type: Sequelize.STRING(20),
        unique: false,
        allowNull: true
      },
      colonnetotal: {
        type: Sequelize.STRING(20),
        unique: false,
        allowNull: true
      },
      exercice: {
        type: Sequelize.STRING(5),
        unique: false,
        allowNull: true
      },
      operation: {
        type: Sequelize.STRING(20),
        unique: false,
        allowNull: true
      },
      },
      {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('controlematricedetails');
  }
};
