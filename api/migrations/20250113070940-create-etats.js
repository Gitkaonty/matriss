'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('etats', {
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
      valide: {
          type: Sequelize.BOOLEAN,
          unique: false,
          allowNull: false,
          defaultValue:false
      },
      nbranomalie: {
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
    await queryInterface.dropTable('etats');
  }
};
