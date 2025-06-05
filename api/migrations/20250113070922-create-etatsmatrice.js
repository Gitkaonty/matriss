'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('etatsmatrices', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        autoIncrement:true,
        primaryKey:true
      },
      code: {
          type: Sequelize.STRING(15),
          unique: false,
          allowNull: false
      },
      nom: {
          type: Sequelize.STRING(250),
          unique: false,
          allowNull: false
      },
      ordre: {
          type: Sequelize.INTEGER,
          unique: false,
          allowNull: false,
          defaultValue:0
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('etatsmatrices');
  }
};
