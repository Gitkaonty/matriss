'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('liassedrfs', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        autoIncrement:true,
        primaryKey:true
      },
      id_compte: {
          type: Sequelize.BIGINT,
          allowNull: false
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
          allowNull: false,
          defaultValue:0
      },
      id_rubrique: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue:0
      },
      note: {
          type: Sequelize.STRING(50),
          allowNull: true,
      },
      type_calcul: {
          type: Sequelize.STRING(10),
          allowNull: true,
      },
      montant_brut: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      signe: {
          type: Sequelize.STRING(50),
          allowNull: true,
      },
      ordre: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue:0
      },
      niveau: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue:0
      },
      nature: {
        type: Sequelize.STRING(15),
        allowNull: true,
    },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('liassedrfs');
  }
};
