'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('codejournals', {
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      id_dossier: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue:0
      },
      code: {
          type: Sequelize.STRING(10),
          unique: false,
          allowNull: true
      },
      libelle: {
        type: Sequelize.STRING(100),
        unique: false,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING(20),
        unique: false,
        allowNull: true
      },
      compteassocie: {
        type: Sequelize.STRING(30),
        unique: false,
        allowNull: true
      },
      nif: {
        type: Sequelize.STRING(30),
        unique: false,  
        allowNull: true
      },
      stat: {
        type: Sequelize.STRING(20),
        unique: false,
        allowNull: true
      },
      adresse: {
        type: Sequelize.STRING(200),
        unique: false,
        allowNull: true
    },
      
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('codejournals');
  }
};
