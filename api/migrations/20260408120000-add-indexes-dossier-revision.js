'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Index pour dossier_revision
    await queryInterface.addIndex('dossier_revision', ['id_compte', 'id_dossier', 'id_exercice', 'id_periode'], {
      name: 'idx_dossier_revision_context'
    });
    await queryInterface.addIndex('dossier_revision', ['id_code'], {
      name: 'idx_dossier_revision_code'
    });
    await queryInterface.addIndex('dossier_revision', ['id_compte', 'id_dossier', 'id_exercice', 'id_periode', 'id_code'], {
      name: 'idx_dossier_revision_unique_lookup'
    });

    // Index pour dossier_revision_synthese
    await queryInterface.addIndex('dossier_revision_synthese', ['id_compte', 'id_dossier', 'id_exercice', 'id_periode', 'cycle'], {
      name: 'idx_dossier_revision_synthese_lookup'
    });
    await queryInterface.addIndex('dossier_revision_synthese', ['cycle'], {
      name: 'idx_dossier_revision_synthese_cycle'
    });

    // Index pour dossier_revision_commentaire
    await queryInterface.addIndex('dossier_revision_commentaire', ['id_compte', 'id_dossier', 'id_exercice', 'id_periode', 'cycle'], {
      name: 'idx_dossier_revision_commentaire_lookup'
    });
    await queryInterface.addIndex('dossier_revision_commentaire', ['cycle'], {
      name: 'idx_dossier_revision_commentaire_cycle'
    });

    // Index pour dossier_revision_matrice
    await queryInterface.addIndex('dossier_revision_matrice', ['cycle'], {
      name: 'idx_dossier_revision_matrice_cycle'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('dossier_revision', 'idx_dossier_revision_context');
    await queryInterface.removeIndex('dossier_revision', 'idx_dossier_revision_code');
    await queryInterface.removeIndex('dossier_revision', 'idx_dossier_revision_unique_lookup');
    await queryInterface.removeIndex('dossier_revision_synthese', 'idx_dossier_revision_synthese_lookup');
    await queryInterface.removeIndex('dossier_revision_synthese', 'idx_dossier_revision_synthese_cycle');
    await queryInterface.removeIndex('dossier_revision_commentaire', 'idx_dossier_revision_commentaire_lookup');
    await queryInterface.removeIndex('dossier_revision_commentaire', 'idx_dossier_revision_commentaire_cycle');
    await queryInterface.removeIndex('dossier_revision_matrice', 'idx_dossier_revision_matrice_cycle');
  }
};
