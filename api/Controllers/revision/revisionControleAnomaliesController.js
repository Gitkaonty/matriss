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
    let comptesList = []; // Pour SENS_SOLDE (comptes concernés, pas les IDs de lignes)
    
    console.log(`getAnomaliesByControle - Type: ${controle?.Type}, anomalies count: ${anomalies.length}, idJnlKeys:`, idJnlKeys);
    
    // Type spécial: id_jnl = ID de ligne journal individuelle (nouveau comportement)
    // Utilisé par SENS_SOLDE, SENS_ECRITURE, IMMO_CHARGE avec anomalies individuelles par ligne
    if (controle?.Type === 'SENS_SOLDE' || controle?.Type === 'SENS_ECRITURE' || controle?.Type === 'IMMO_CHARGE') {
      // Nouveau comportement: id_jnl = ID de ligne journal individuelle
      // On récupère les lignes par leur ID
      const lineIds = idJnlKeys
        .map(v => parseInt(v, 10))
        .filter(v => Number.isFinite(v));
      
      if (lineIds.length > 0) {
        const whereClause = {
          id: { [Op.in]: lineIds },
          id_compte: id_compte,
          id_dossier: id_dossier,
          id_exercice: id_exercice,
          ...dateFilter
        };
        console.log('getAnomaliesByControle ligne mode (individuel) - where:', whereClause);
        const lines = await db.journals.findAll({
          where: whereClause,
          order: [['dateecriture', 'ASC'], ['id', 'ASC']]
        });
        journalLines = lines;
        console.log(`getAnomaliesByControle - ${lines.length} lignes individuelles trouvées`);
        
        // Extraire la liste des comptes pour l'affichage
        comptesList = [...new Set(lines.map(l => l.comptegen).filter(Boolean))];
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
      if (controle?.Type === 'SENS_SOLDE' || controle?.Type === 'SENS_ECRITURE' || controle?.Type === 'IMMO_CHARGE') {
        // Pour ces types, id_jnl = ID de ligne journal individuelle
        // On filtre par ID de ligne
        lines = journalLines.filter(l => String(l.id) === String(a.id_jnl));
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
      
      // Pour SENS_SOLDE, SENS_ECRITURE, IMMO_CHARGE: compteNum = compte de la ligne
      const compteNum = (controle?.Type === 'SENS_SOLDE' || controle?.Type === 'SENS_ECRITURE' || controle?.Type === 'IMMO_CHARGE') 
        ? (lines[0]?.comptegen || a.id_jnl) 
        : null;
      
      return {
        ...a.toJSON(),
        affichage,
        journalLines: lines,
        compteNum: compteNum
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
    const { valide, commentaire, id_periode, validateAllByEcriture } = req.body;

    console.log('=== UPDATE ANOMALY ===');
    console.log('Params:', { id_compte, id_dossier, id_exercice, id_anomalie });
    console.log('Body:', { valide, commentaire, id_periode, validateAllByEcriture });

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

    console.log('Anomalie trouvée:', { id: anomaly.id, valide: anomaly.valide, id_periode: anomaly.id_periode, id_jnl: anomaly.id_jnl, id_controle: anomaly.id_controle });

    // Récupérer le contrôle pour connaître son type
    const controle = await db.revisionControle.findOne({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_controle: anomaly.id_controle
      }
    });

    const isUtilCptTva = controle?.Type === 'UTIL_CPT_TVA';
    console.log('Type de contrôle:', controle?.Type, '- isUtilCptTva:', isUtilCptTva);

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

    // Pour UTIL_CPT_TVA avec validateAllByEcriture=true, valider toutes les anomalies du même id_ecriture
    let updatedCount = 1;
    if (isUtilCptTva && validateAllByEcriture && typeof valide === 'boolean' && anomaly.id_jnl) {
      console.log(`UTIL_CPT_TVA - Validation groupée pour id_ecriture=${anomaly.id_jnl}`);
      
      const [updated] = await db.tableControleAnomalies.update(updatePayload, {
        where: {
          id_compte,
          id_dossier,
          id_exercice,
          id_controle: anomaly.id_controle,
          id_jnl: anomaly.id_jnl
        }
      });
      
      updatedCount = updated;
      console.log(`${updated} anomalies mises à jour pour l'écriture ${anomaly.id_jnl}`);
    } else {
      // Mise à jour standard d'une seule anomalie
      await anomaly.update(updatePayload);
      console.log('Anomalie mise à jour avec succès');
    }

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
      anomaly: anomaly.toJSON(),
      updatedCount: updatedCount,
      validateAllByEcriture: isUtilCptTva && validateAllByEcriture
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