'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('userscomptes', {
        id_compte: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        nom: {
            type: Sequelize.STRING(255),
            allowNull: true
        },
        pardefault: {
            type: Sequelize.BOOLEAN,
        }
      },
      {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('userscomptes');
  }
};
