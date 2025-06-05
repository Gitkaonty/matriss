'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('exercices', {
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      id_dossier: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue:0
      },
      date_debut: {
          type: Sequelize.DATE,
          unique: false,
          allowNull: false
      },
      date_fin: {
          type: Sequelize.DATE,
          unique: true,
          allowNull: false
      },
      libelle_rang: {
          type: Sequelize.STRING(5),
          unique: false,
          allowNull: true
      },
      rang: {
          type: Sequelize.INTEGER,
          unique: false,
          allowNull: true,
          defaultValue:0
      },
      cloture: {
          type: Sequelize.BOOLEAN,
          unique: false,
          allowNull: true,
          defaultValue:false
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('exercices');
  }
};
