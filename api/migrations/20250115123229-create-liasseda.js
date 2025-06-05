'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('liassedas', {
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
      rubriques_poste: {
          type: Sequelize.STRING(25),
          allowNull: true,
      },
      date_acquisition: {
          type: Sequelize.DATE,
          allowNull: true,
      },
      taux: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      valeur_acquisition: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      augmentation: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      diminution: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      amort_anterieur: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      dotation_exercice: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      amort_cumule: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      valeur_nette: {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue:0
      },
      libelle: {
          type: Sequelize.STRING(250),
          allowNull: true,
      },
      num_compte: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue:0
      },
      nature: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      ordre: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue:0
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('liassedas');
  }
};
