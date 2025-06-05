'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('dossierassocies', {
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      id_compte: {
          type: Sequelize.BIGINT,
          allowNull: false
      },
      type: {
          type: Sequelize.STRING(5),
          unique: false,
          allowNull: true
      },
      nom: {
          type: Sequelize.STRING(150),
          unique: false,
          allowNull: true
      },
      adresse: {
          type: Sequelize.STRING(200),
          unique: false,
          allowNull: true
      },
      dateentree: {
          type: Sequelize.DATE,
          unique: false,
          allowNull: true
      },
      datesortie: {
          type: Sequelize.DATE,
          unique: false,
          allowNull: true
      },
      nbrpart: {
          type: Sequelize.INTEGER,
          unique: false,
          allowNull: false,
          defaultValue:0
      },
      enactivite: {
          type: Sequelize.BOOLEAN,
          unique: false,
          allowNull: false,
          defaultValue:false
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('dossierassocies');
  }
};
