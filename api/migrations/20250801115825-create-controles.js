'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('controles', {
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
      nbranomalie: {
        type: Sequelize.INTEGER,
        unique: false,
        defaultValue:0
      },
      anomalie: {
        type: Sequelize.STRING(255),
        unique: false,
        allowNull: true
      },
      valide: {
        type: Sequelize.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue:false
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
    await queryInterface.dropTable('controles');
  }
};
