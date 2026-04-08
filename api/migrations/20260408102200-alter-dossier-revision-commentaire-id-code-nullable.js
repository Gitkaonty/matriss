'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('dossier_revision_commentaire', 'id_code', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('dossier_revision_commentaire', 'id_code', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
