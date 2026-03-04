'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Supprimer l'ancien index unique (créé par 20260303000003)
    await queryInterface.removeIndex('revision_commentaire_anomalies', 'unique_commentaire_controle_jnl');

    // Créer le nouvel index unique avec id_periode
    await queryInterface.addIndex(
      'revision_commentaire_anomalies',
      ['id_compte', 'id_dossier', 'id_exercice', 'id_controle', 'id_jnl', 'id_periode'],
      {
        name: 'unique_commentaire_controle_jnl_periode',
        unique: true
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Supprimer le nouvel index
    await queryInterface.removeIndex('revision_commentaire_anomalies', 'unique_commentaire_controle_jnl_periode');

    // Recréer l'ancien index sans id_periode
    await queryInterface.addIndex(
      'revision_commentaire_anomalies',
      ['id_compte', 'id_dossier', 'id_exercice', 'id_controle', 'id_jnl'],
      {
        unique: true,
        name: 'unique_commentaire_controle_jnl',
        where: { id_controle: { [Sequelize.Op.ne]: null } }
      }
    );
  }
};