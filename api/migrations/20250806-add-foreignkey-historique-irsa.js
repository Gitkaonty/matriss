'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('historique_irsa', {
      fields: ['idDossier'],
      type: 'foreign key',
      name: 'fk_historiqueirsa_dossier',
      references: {
        table: 'dossiers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('historique_irsa', {
      fields: ['idCompte'],
      type: 'foreign key',
      name: 'fk_historiqueirsa_compte',
      references: {
        table: 'userscomptes',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('historique_irsa', 'fk_historiqueirsa_dossier');
    await queryInterface.removeConstraint('historique_irsa', 'fk_historiqueirsa_compte');
  }
};