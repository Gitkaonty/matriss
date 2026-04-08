'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ==================== TABLES DE REVISION ====================
    // Index pour dossier_revision
    await queryInterface.addIndex('dossier_revision', ['id_compte', 'id_dossier', 'id_exercice', 'id_periode'], {
      name: 'idx_dossier_revision_context'
    });
    await queryInterface.addIndex('dossier_revision', ['id_code'], {
      name: 'idx_dossier_revision_code'
    });
    await queryInterface.addIndex('dossier_revision', ['id_compte', 'id_dossier', 'id_exercice', 'id_periode', 'id_code'], {
      name: 'idx_dossier_revision_full'
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

    // Index pour revision_commentaire_anomalies
    await queryInterface.addIndex('revision_commentaire_anomalies', ['id_compte', 'id_dossier'], {
      name: 'idx_revision_commentaire_anomalies_context'
    });
    await queryInterface.addIndex('revision_commentaire_anomalies', ['id_exercice', 'id_periode'], {
      name: 'idx_revision_commentaire_anomalies_exercice_periode'
    });
    await queryInterface.addIndex('revision_commentaire_anomalies', ['id_anomalie'], {
      name: 'idx_revision_commentaire_anomalies_anomalie'
    });

    // ==================== TABLES PRINCIPALES (JOURNAUX/ECRITURES) ====================
    // Index pour journals
    await queryInterface.addIndex('journals', ['id_dossier'], {
      name: 'idx_journals_dossier'
    });
    await queryInterface.addIndex('journals', ['id_dossier', 'id_periode'], {
      name: 'idx_journals_dossier_periode'
    });
    await queryInterface.addIndex('journals', ['id_dossier', 'id_exercice'], {
      name: 'idx_journals_dossier_exercice'
    });
    await queryInterface.addIndex('journals', ['id_numcpt'], {
      name: 'idx_journals_numcpt'
    });
    await queryInterface.addIndex('journals', ['date_ecriture'], {
      name: 'idx_journals_date'
    });

    // ==================== TABLES DE COMPTA ANALYTIQUE ====================
    // Index pour analytiques
    await queryInterface.addIndex('analytiques', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_analytiques_context'
    });
    await queryInterface.addIndex('analytiques', ['id_ligne_ecriture'], {
      name: 'idx_analytiques_ligne'
    });
    await queryInterface.addIndex('analytiques', ['id_axe'], {
      name: 'idx_analytiques_axe'
    });
    await queryInterface.addIndex('analytiques', ['id_section'], {
      name: 'idx_analytiques_section'
    });

    // Index pour balance_analytiques
    await queryInterface.addIndex('balance_analytiques', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_balance_analytiques_context'
    });
    await queryInterface.addIndex('balance_analytiques', ['id_numcpt'], {
      name: 'idx_balance_analytiques_numcpt'
    });
    await queryInterface.addIndex('balance_analytiques', ['id_axe'], {
      name: 'idx_balance_analytiques_axe'
    });
    await queryInterface.addIndex('balance_analytiques', ['id_section'], {
      name: 'idx_balance_analytiques_section'
    });

    // Index pour ca_axes
    await queryInterface.addIndex('caaxes', ['id_compte', 'id_dossier'], {
      name: 'idx_caaxes_context'
    });

    // Index pour ca_sections
    await queryInterface.addIndex('casections', ['id_compte', 'id_dossier'], {
      name: 'idx_casections_context'
    });
    await queryInterface.addIndex('casections', ['id_axe'], {
      name: 'idx_casections_axe'
    });

    // ==================== TABLES DE BALANCE/LIASSE ====================
    // Index pour balances
    await queryInterface.addIndex('balances', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_balances_context'
    });
    await queryInterface.addIndex('balances', ['id_numcompte'], {
      name: 'idx_balances_numcompte'
    });
    await queryInterface.addIndex('balances', ['rubriquebilanbrut'], {
      name: 'idx_balances_rubrique'
    });

    // Index pour ajustements
    await queryInterface.addIndex('ajustements', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_ajustements_context'
    });
    await queryInterface.addIndex('ajustements', ['id_rubrique'], {
      name: 'idx_ajustements_rubrique'
    });

    // Index pour rubriques
    await queryInterface.addIndex('rubriques', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_rubriques_context'
    });
    await queryInterface.addIndex('rubriques', ['id_rubrique'], {
      name: 'idx_rubriques_id'
    });

    // Index pour compterubriques
    await queryInterface.addIndex('compterubriques', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_compterubriques_context'
    });
    await queryInterface.addIndex('compterubriques', ['id_rubrique'], {
      name: 'idx_compterubriques_rubrique'
    });

    // Index pour rubriquesmatrices
    await queryInterface.addIndex('rubriquesmatrices', ['id_rubrique'], {
      name: 'idx_rubriquesmatrices_id'
    });

    // ==================== TABLES DE DOSSIER/EXERCICE/PERIODE ====================
    // Index pour dossiers
    await queryInterface.addIndex('dossiers', ['id_compte'], {
      name: 'idx_dossiers_compte'
    });

    // Index pour exercices
    await queryInterface.addIndex('exercices', ['id_compte', 'id_dossier'], {
      name: 'idx_exercices_context'
    });

    // Index pour periodes
    await queryInterface.addIndex('periodes', ['id_exercice', 'id_compte', 'id_dossier'], {
      name: 'idx_periodes_context'
    });
    await queryInterface.addIndex('periodes', ['id_exercice'], {
      name: 'idx_periodes_exercice'
    });

    // ==================== TABLES DE DROIT DE COMMUNICATION ====================
    // Index pour droitcommas
    await queryInterface.addIndex('droitcommas', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_droitcommas_context'
    });
    await queryInterface.addIndex('droitcommas', ['id_numcpt'], {
      name: 'idx_droitcommas_numcpt'
    });

    // Index pour droitcommbs
    await queryInterface.addIndex('droitcommbs', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_droitcommbs_context'
    });
    await queryInterface.addIndex('droitcommbs', ['id_numcpt'], {
      name: 'idx_droitcommbs_numcpt'
    });

    // ==================== TABLES DE DECLARATIONS ====================
    // Index pour formulaire_tva_annexes
    await queryInterface.addIndex('formulaire_tva_annexes', ['id_dossier', 'id_exercice', 'id_periode'], {
      name: 'idx_tva_annexes_context'
    });

    // Index pour anomalies_formulaire_tva
    await queryInterface.addIndex('anomalies_formulaire_tva', ['id_dossier', 'id_exercice'], {
      name: 'idx_anomalies_tva_context'
    });

    // Index pour etatsdeclarations
    await queryInterface.addIndex('etatsdeclarations', ['id_dossier', 'id_exercice', 'id_periode'], {
      name: 'idx_etatsdeclarations_context'
    });

    // Index pour etatsdge
    await queryInterface.addIndex('etatsdge', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_etatsdge_context'
    });

    // Index pour etatscentresfiscales
    await queryInterface.addIndex('etatscentresfiscales', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_etatscentresfiscales_context'
    });

    // ==================== TABLES DIVERS ====================
    // Index pour dossierplancomptable
    await queryInterface.addIndex('dossierplancomptable', ['id_dossier'], {
      name: 'idx_dossierplancomptable_dossier'
    });
    await queryInterface.addIndex('dossierplancomptable', ['id_dossier', 'id'], {
      name: 'idx_dossierplancomptable_dossier_id'
    });

    // Index pour userscomptes
    await queryInterface.addIndex('userscomptes', ['email'], {
      name: 'idx_userscomptes_email'
    });

    // Index pour etats_tva_annexes (legacy)
    await queryInterface.addIndex('etats_tva_annexes', ['id_dossier', 'id_exercice'], {
      name: 'idx_etats_tva_annexes_context'
    });
    await queryInterface.addIndex('etats_tva_annexes', ['id_ecriture'], {
      name: 'idx_etats_tva_annexes_ecriture'
    });

    // Index pour revision_analytique_resultats
    await queryInterface.addIndex('revision_analytique_resultats', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_revision_analytique_context'
    });
    await queryInterface.addIndex('revision_analytique_resultats', ['id_jnl'], {
      name: 'idx_revision_analytique_jnl'
    });

    // Index pour isi
    await queryInterface.addIndex('isi', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_isi_context'
    });
    await queryInterface.addIndex('isi', ['id_numcpt'], {
      name: 'idx_isi_numcpt'
    });

    // Index pour consolidation_dossier
    await queryInterface.addIndex('consolidation_dossiers', ['id_compte', 'id_dossier'], {
      name: 'idx_consolidation_dossier_context'
    });

    // Index pour consolidation_compte
    await queryInterface.addIndex('consolidation_comptes', ['id_compte', 'id_dossier'], {
      name: 'idx_consolidation_compte_context'
    });
    await queryInterface.addIndex('consolidation_comptes', ['id_numcpt'], {
      name: 'idx_consolidation_compte_numcpt'
    });

    // Index pour historique_declaration
    await queryInterface.addIndex('historique_declarations', ['id_compte', 'id_dossier', 'id_exercice'], {
      name: 'idx_historique_declaration_context'
    });

    // Index pour devise
    await queryInterface.addIndex('devises', ['id_compte'], {
      name: 'idx_devises_compte'
    });

    // Index pour compte_dossiers (table de jointure)
    await queryInterface.addIndex('compte_dossiers', ['user_id', 'id_dossier'], {
      name: 'idx_compte_dossiers_lookup'
    });

    // Index pour compte_portefeuilles (table de jointure)
    await queryInterface.addIndex('compte_portefeuilles', ['user_id', 'id_portefeuille'], {
      name: 'idx_compte_portefeuilles_lookup'
    });
  },

  async down(queryInterface, Sequelize) {
    // Suppression de tous les index créés
    const indexes = [
      // Revision
      'idx_dossier_revision_context', 'idx_dossier_revision_code', 'idx_dossier_revision_full',
      'idx_dossier_revision_synthese_lookup', 'idx_dossier_revision_synthese_cycle',
      'idx_dossier_revision_commentaire_lookup', 'idx_dossier_revision_commentaire_cycle',
      'idx_dossier_revision_matrice_cycle',
      // Journals
      'idx_journals_dossier', 'idx_journals_dossier_periode', 'idx_journals_dossier_exercice',
      'idx_journals_numcpt', 'idx_journals_date',
      // Analytique
      'idx_analytiques_context', 'idx_analytiques_ligne', 'idx_analytiques_axe', 'idx_analytiques_section',
      'idx_balance_analytiques_context', 'idx_balance_analytiques_numcpt',
      'idx_balance_analytiques_axe', 'idx_balance_analytiques_section',
      'idx_caaxes_context', 'idx_casections_context', 'idx_casections_axe',
      // Balance/Liasse
      'idx_balances_context', 'idx_balances_numcompte', 'idx_balances_rubrique',
      'idx_ajustements_context', 'idx_ajustements_rubrique',
      'idx_rubriques_context', 'idx_rubriques_id',
      'idx_compterubriques_context', 'idx_compterubriques_rubrique',
      'idx_rubriquesmatrices_id',
      // Dossier/Exercice/Periode
      'idx_dossiers_compte', 'idx_exercices_context', 'idx_periodes_context', 'idx_periodes_exercice',
      // Droit comm
      'idx_droitcommas_context', 'idx_droitcommas_numcpt',
      'idx_droitcommbs_context', 'idx_droitcommbs_numcpt',
      // Declarations
      'idx_tva_annexes_context', 'idx_anomalies_tva_context', 'idx_etatsdeclarations_context',
      'idx_etatsdge_context', 'idx_etatscentresfiscales_context',
      // Divers
      'idx_dossierplancomptable_dossier', 'idx_dossierplancomptable_dossier_id',
      'idx_userscomptes_email',
      'idx_etats_tva_annexes_context', 'idx_etats_tva_annexes_ecriture',
      'idx_revision_analytique_context', 'idx_revision_analytique_jnl',
      'idx_isi_context', 'idx_isi_numcpt',
      'idx_consolidation_dossier_context',
      'idx_consolidation_compte_context', 'idx_consolidation_compte_numcpt',
      'idx_historique_declaration_context',
      'idx_devises_compte',
      'idx_compte_dossiers_lookup', 'idx_compte_portefeuilles_lookup',
    ];

    for (const indexName of indexes) {
      try {
        await queryInterface.removeIndex(indexName);
      } catch (e) {
        console.log(`Index ${indexName} may not exist, skipping...`);
      }
    }
  }
};
