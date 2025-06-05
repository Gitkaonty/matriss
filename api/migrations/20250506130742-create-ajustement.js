'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ajustements', {
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue:0
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
          unique: false,
          allowNull: true
      },
      id_rubrique: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue:0
      },
      nature: {
          type: Sequelize.STRING(25),
          unique: false,
          allowNull: true
      },
      motif: {
          type: Sequelize.STRING(50),
          unique: false,
          allowNull: true
      },
      montant: {
          type: Sequelize.DOUBLE,
          unique: false,
          allowNull: false,
          defaultValue:0
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ajustements');
  }
};
