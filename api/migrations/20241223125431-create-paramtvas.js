'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('paramtvas', {
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      id_dossier: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue:0
      },
      id_cptcompta: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue:0
      },
      type: {
        type: Sequelize.STRING(20),
        unique: false,
        allowNull: true
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('paramtvas');
  }
};
