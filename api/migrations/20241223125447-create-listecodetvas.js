'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('listecodetvas', {
      code: {
        type: Sequelize.STRING(10),
        unique: false,
        allowNull: true
      },
      nature: {
        type: Sequelize.STRING(10),
        unique: false,
        allowNull: true
      },
      libelle: {
        type: Sequelize.STRING(200),
        unique: false,
        allowNull: true
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('listecodetvas');
  }
};
