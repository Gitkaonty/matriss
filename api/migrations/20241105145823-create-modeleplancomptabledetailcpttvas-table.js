'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('modeleplancomptabledetailcpttvas', {
      id_compte: {
          type: Sequelize.BIGINT,
          allowNull: false
      },
      id_modeleplancomptable: {
          type: Sequelize.BIGINT,
          allowNull: false
      },
      id_detail: {
          type: Sequelize.BIGINT,
          allowNull: false
      },
      compte: {
          type: Sequelize.STRING,
          allowNull: true
      },
      libelle: {
          type: Sequelize.STRING,
          allowNull: true
      },
      id_comptecompta: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue:0
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('modeleplancomptabledetailcpttvas');
  }
};
