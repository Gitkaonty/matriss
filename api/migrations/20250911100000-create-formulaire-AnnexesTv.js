'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('formulaire_tva_annexes', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      id_code: { type: Sequelize.BIGINT, allowNull: false },
      libelle: { type: Sequelize.STRING(250), allowNull: false },
      montant: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'userscomptes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'dossiers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_exercice: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'exercices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('formulaire_tva_annexes', ['id_dossier', 'id_compte', 'id_exercice']);
    await queryInterface.addIndex('formulaire_tva_annexes', ['id_code']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('formulaire_tva_annexes');
  }
};
