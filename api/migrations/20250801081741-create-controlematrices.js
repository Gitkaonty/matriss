'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('controlematrices', {
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
      typecontrol: {
          type: Sequelize.STRING(20),
          unique: false,
          allowNull: true
      },
      typecomparaison: {
        type: Sequelize.STRING(20),
        unique: false,
        allowNull: true
      },
      nbrgroup: {
        type: Sequelize.INTEGER,
        unique: false,
        defaultValue:0
      },
      comments: {
        type: Sequelize.STRING(255),
        unique: false,
        allowNull: true
      },
      },
      {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('controlematrices');
  }
};
