const db = require('../../Models');
const { Op } = require('sequelize');

// Récupérer les anomalies depuis table_controle_anomalies pour un contrôle donné (par id_controle code)
exports.getAnomaliesByControle = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_controle } = req.params;
    const { date_debut, date_fin } = req.query;

    console.log('\n========================================');
    console.log('🚀 GET ANOMALIES BY CONTROLE APPELÉ');
    console.log('========================================');
    console.log('Params:', { id_compte, id_dossier, id_exercice, id_controle, date_debut, date_fin });

    // Construire le filtre de date pour les requêtes journals
    let dateFilter = {};
    if (date_debut && date_fin) {
      dateFilter = {
        dateecriture: {
          [Op.gte]: date_debut,
          [Op.lte]: date_fin
        }
      };
      console.log('Filtre date appliqué:', dateFilter);
    }

    // Récupérer le contrôle pour connaître son Affichage
    const controle = await db.revisionControle.findOne({
      where: {
        id_compte: id_compte,
        id_dossier: id_dossier,
        id_exercice: id_exercice,
        id_controle: id_controle
      }
    });

    const affichage = controle?.Affichage || 'ligne';

    // Récupérer les anomalies pour ce contrôle
    const anomalies = await db.tableControleAnomalies.findAll({
      where: {
        id_compte: id_compte,
        id_dossier: id_dossier,
        id_exercice: id_exercice,
        id_controle: id_controle
      },
      order: [['id', 'ASC']]
    });

    // Récupérer les lignes de journal selon le mode
    const idJnlKeys = [...new Set(anomalies.map(a => a.id_jnl).filter(Boolean))];
    
    let journalLines = [];
    let comptesList = []; // Pour SENS_SOLDE
    
    console.log(`getAnomaliesByControle - Type: ${controle?.Type}, anomalies count: ${anomalies.length}, idJnlKeys:`, idJnlKeys);
    
    // Type spécial SENS_SOLDE, SENS_ECRITURE et IMMO_CHARGE: id_jnl = numéro de compte
    // On récupère les lignes du journal où comptegen = id_jnl
    if (controle?.Type === 'SENS_SOLDE' || controle?.Type === 'SENS_ECRITURE' || controle?.Type === 'IMMO_CHARGE') {
      comptesList = idJnlKeys;
      if (idJnlKeys.length > 0) {
        const whereClause = {
          comptegen: { [Op.in]: idJnlKeys },
          id_compte: id_compte,
          id_dossier: id_dossier,
          id_exercice: id_exercice,
          ...dateFilter
        };
        console.log('getAnomaliesByControle SENS_SOLDE/SENS_ECRITURE/IMMO_CHARGE - where:', whereClause);
        const lines = await db.journals.findAll({
          where: whereClause,
          order: [['dateecriture', 'ASC'], ['id', 'ASC']]
        });
        journalLines = lines;
        console.log(`getAnomaliesByControle - ${lines.length} lignes de journal trouvees pour comptes:`, idJnlKeys);
      }
    } else if (controle?.Type === 'UTIL_CPT_TVA') {
      // Pour UTIL_CPT_TVA, id_jnl = id_ecriture (l'ID de l'écriture complète)
      // Récupérer toutes les lignes des écritures concernées
      if (idJnlKeys.length > 0) {
        const whereClause = {
          id_ecriture: { [Op.in]: idJnlKeys },
          id_compte: id_compte,
          id_dossier: id_dossier,
          id_exercice: id_exercice,
          ...dateFilter
        };
        console.log('getAnomaliesByControle UTIL_CPT_TVA - where:', whereClause);
        const lines = await db.journals.findAll({
          where: whereClause,
          order: [['dateecriture', 'ASC'], ['id', 'ASC']]
        });
        journalLines = lines;
        console.log(`getAnomaliesByControle UTIL_CPT_TVA - ${lines.length} lignes trouvées pour écritures:`, idJnlKeys);
      }
    } else if (affichage === 'ecriture') {
      // Mode ecriture: id_jnl = id_ecriture (string)
      const whereClause = {
        id_ecriture: { [Op.in]: idJnlKeys },
        id_compte: id_compte,
        id_dossier: id_dossier,
        id_exercice: id_exercice,
        ...dateFilter
      };
      console.log('getAnomaliesByControle ecriture mode - where:', whereClause);
      const lines = await db.journals.findAll({
        where: whereClause,
        order: [['dateecriture', 'ASC'], ['id', 'ASC']]
      });
      journalLines = lines;
    } else {
      // Mode ligne: id_jnl = journals.id (converti en int pour la requête)
      const ids = idJnlKeys
        .map(v => parseInt(v, 10))
        .filter(v => Number.isFinite(v));
      
      if (ids.length > 0) {
        const whereClause = {
          id: { [Op.in]: ids },
          id_compte: id_compte,
          id_dossier: id_dossier,
          id_exercice: id_exercice,
          ...dateFilter
        };
        console.log('getAnomaliesByControle ligne mode - where:', whereClause);
        const lines = await db.journals.findAll({
          where: whereClause
        });
        journalLines = lines;
      }
    }

    // Joindre les lignes aux anomalies
    const payload = anomalies.map(a => {
      let lines = [];
      if (controle?.Type === 'SENS_SOLDE' || controle?.Type === 'SENS_ECRITURE') {
        // Pour SENS_SOLDE et SENS_ECRITURE, id_jnl = compte, on filtre par comptegen
        lines = journalLines.filter(l => String(l.comptegen) === String(a.id_jnl));
      } else if (controle?.Type === 'IMMO_CHARGE') {
        // Pour IMMO_CHARGE, afficher uniquement les lignes avec débit > 500 (anomalies)
        lines = journalLines.filter(l => {
          const debit = parseFloat(l.debit) || 0;
          return String(l.comptegen) === String(a.id_jnl) && debit > 500;
        });
      } else if (controle?.Type === 'UTIL_CPT_TVA') {
        // Pour UTIL_CPT_TVA, id_jnl = id_ecriture, on filtre par id_ecriture
        lines = journalLines.filter(l => String(l.id_ecriture) === String(a.id_jnl));
      } else if (affichage === 'ecriture') {
        lines = journalLines.filter(l => String(l.id_ecriture) === String(a.id_jnl));
      } else {
        lines = journalLines.filter(l => String(l.id) === String(a.id_jnl));
      }
      
      if (controle?.Type === 'ATYPIQUE') {
        console.log(`DEBUG ATYPIQUE PAYLOAD - id_jnl=${a.id_jnl}, journalLines total=${journalLines.length}, lines filtrées=${lines.length}`);
      }
      
      return {
        ...a.toJSON(),
        affichage,
        journalLines: lines,
        compteNum: (controle?.Type === 'SENS_SOLDE' || controle?.Type === 'SENS_ECRITURE' || controle?.Type === 'IMMO_CHARGE') ? a.id_jnl : null
      };
    });

    if (controle?.Type === 'ATYPIQUE') {
      console.log('DEBUG ATYPIQUE FINAL - payload:', payload.map(p => ({ id: p.id, id_jnl: p.id_jnl, journalLinesCount: p.journalLines?.length })));
    }

    res.json({
      state: true,
      anomalies: payload,
      controle: controle ? controle.toJSON() : null,
      affichage,
      comptesList: (controle?.Type === 'SENS_SOLDE' || controle?.Type === 'SENS_ECRITURE' || controle?.Type === 'IMMO_CHARGE') ? comptesList : null,
      count: payload.length
    });
  } catch (error) {
    console.error('Error in getAnomaliesByControle:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la recupération des anomalies',
      error: error.message
    });
  }
};

// Mettre à jour une anomalie (valider/annuler/commenter/id_periode)
exports.updateAnomaly = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_anomalie } = req.params;
    const { valide, commentaire, id_periode } = req.body;

    console.log('=== UPDATE ANOMALY ===');
    console.log('Params:', { id_compte, id_dossier, id_exercice, id_anomalie });
    console.log('Body:', { valide, commentaire, id_periode });

    const anomaly = await db.tableControleAnomalies.findOne({
      where: {
        id: id_anomalie,
        id_compte,
        id_dossier,
        id_exercice
      }
    });

    if (!anomaly) {
      console.log('Anomalie non trouvée:', id_anomalie);
      return res.status(404).json({ 
        state: false, 
        message: 'Anomalie non trouvée. Elle a peut-être été supprimée lors d\'un re-contrôle si elle n\'est plus détectée.' 
      });
    }

    console.log('Anomalie trouvée:', { id: anomaly.id, valide: anomaly.valide, id_periode: anomaly.id_periode });

    const updatePayload = {};
    if (typeof valide === 'boolean') updatePayload.valide = valide;
    if (commentaire !== undefined) updatePayload.commentaire = commentaire;
    
    // Si id_periode fourni, l'utiliser, sinon chercher une période pour l'exercice si l'anomalie n'en a pas
    if (id_periode !== undefined) {
      updatePayload.id_periode = id_periode;
      console.log('id_periode fourni dans body:', id_periode);
    } else if (!anomaly.id_periode) {
      console.log('Anomalie sans id_periode, recherche d\'une période...');
      console.log('Recherche avec:', { id_compte, id_dossier, id_exercice });
      
      // Chercher une période pour cet exercice avec tous les critères
      let periode = await db.periodes.findOne({
        where: {
          id_compte,
          id_dossier,
          id_exercice
        },
        order: [['date_debut', 'ASC']]
      });
      
      // Si pas trouvé, chercher avec id_dossier = 0 (valeur par défaut)
      if (!periode) {
        console.log('Pas trouvé avec id_dossier=' + id_dossier + ', essai avec id_dossier=0');
        periode = await db.periodes.findOne({
          where: {
            id_compte,
            id_dossier: 0,
            id_exercice
          },
          order: [['date_debut', 'ASC']]
        });
      }
      
      // Si toujours pas trouvé, chercher seulement par id_exercice
      if (!periode) {
        console.log('Pas trouvé avec id_dossier=0, essai avec id_exercice seul');
        periode = await db.periodes.findOne({
          where: {
            id_exercice
          },
          order: [['date_debut', 'ASC']]
        });
      }
      console.log('Résultat recherche période:', periode ? { id: periode.id, libelle: periode.libelle, id_dossier: periode.id_dossier } : 'Aucune période trouvée');
      
      if (periode) {
        updatePayload.id_periode = periode.id;
        console.log('Période auto-assignée lors de la validation:', periode.id);
      }
    } else {
      console.log('Anomalie a déjà un id_periode:', anomaly.id_periode);
    }

    console.log('Update payload:', updatePayload);

    await anomaly.update(updatePayload);

    console.log('Anomalie mise à jour avec succès');

    // Mettre à jour le compteur d'anomalies dans table_revisions_controles
    const updateControleQuery = `
      UPDATE table_revisions_controles
      SET anomalies = (
        SELECT COUNT(*) 
        FROM table_controle_anomalies 
        WHERE id_compte = ${id_compte} 
          AND id_dossier = ${id_dossier} 
          AND id_exercice = ${id_exercice}
          AND id_controle = '${anomaly.id_controle}'
          AND (valide = false OR valide IS NULL)
      ),
      "Valider" = (
        SELECT CASE 
          WHEN COUNT(*) = 0 THEN true 
          WHEN COUNT(CASE WHEN valide = true THEN 1 END) = COUNT(*) THEN true 
          ELSE false 
        END
        FROM table_controle_anomalies 
        WHERE id_compte = ${id_compte} 
          AND id_dossier = ${id_dossier} 
          AND id_exercice = ${id_exercice}
          AND id_controle = '${anomaly.id_controle}'
      )
      WHERE id_compte = ${id_compte}
        AND id_dossier = ${id_dossier}
        AND id_exercice = ${id_exercice}
        AND id_controle = '${anomaly.id_controle}'
    `;
    await db.sequelize.query(updateControleQuery, { type: db.Sequelize.QueryTypes.UPDATE });
    console.log('Compteur d\'anomalies et statut Valider mis à jour dans table_revisions_controles');

    return res.json({
      state: true,
      anomaly: anomaly.toJSON()
    });
  } catch (error) {
    console.error('Error in updateAnomaly:', error);
    return res.status(500).json({
      state: false,
      message: 'Erreur lors de la mise à jour de l\'anomalie',
      error: error.message
    });
  }
};