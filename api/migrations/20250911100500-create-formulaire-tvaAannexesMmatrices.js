'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('formulaire_tva_annexes_matrices', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      id_code: { type: Sequelize.BIGINT, allowNull: false },
      libelle: { type: Sequelize.STRING(250), allowNull: false },
      groupe: { type: Sequelize.STRING(4), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('formulaire_tva_annexes_matrices', ['id_code']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('formulaire_tva_annexes_matrices');
  }
};
