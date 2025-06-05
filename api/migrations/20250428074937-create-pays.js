'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('pays', {
      code: {
          type: Sequelize.STRING(5),
          unique: false,
          allowNull: false
      },
      nompays: {
          type: Sequelize.STRING(50),
          unique: false,
          allowNull: false
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('pays');
  }
};

