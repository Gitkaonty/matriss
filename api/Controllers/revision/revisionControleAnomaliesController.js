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

    let dateFilter = {};
    let idPeriode = null;
    
    // Si id_periode est fourni explicitement, l'utiliser directement
    if (req.query.id_periode) {
      idPeriode = parseInt(req.query.id_periode, 10);
      console.log('id_periode fourni explicitement:', idPeriode);
    } else if (date_debut && date_fin) {
      // Sinon, chercher la période par dates (fallback)
      dateFilter = {
        dateecriture: {
          [Op.gte]: date_debut,
          [Op.lte]: date_fin
        }
      };
      console.log('Filtre date appliqué:', dateFilter);
      
      // Déterminer la période correspondante - chercher la période exacte
      const periode = await db.periodes.findOne({
        where: {
          id_compte: id_compte,
          id_dossier: id_dossier,
          id_exercice: id_exercice,
          date_debut: { [Op.lte]: date_debut },
          date_fin: { [Op.gte]: date_fin }
        },
        order: [['date_debut', 'ASC']]
      });
      
      if (periode) {
        idPeriode = periode.id;
        console.log('Période EXACTE trouvée:', idPeriode);
      } else {
        // Fallback: chercher une période qui chevauche
        const periodeChevauche = await db.periodes.findOne({
          where: {
            id_compte: id_compte,
            id_dossier: id_dossier,
            id_exercice: id_exercice,
            date_debut: { [Op.lte]: date_fin },
            date_fin: { [Op.gte]: date_debut }
          },
          order: [['date_debut', 'ASC']]
        });
        
        if (periodeChevauche) {
          idPeriode = periodeChevauche.id;
          console.log('Période CHEVAUCHE trouvée:', idPeriode);
        }
      }
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

    // Récupérer les anomalies pour ce contrôle avec leurs commentaires depuis la nouvelle table
    // IMPORTANT: Convertir les paramètres en nombres car ils arrivent comme des strings
    const idCompteNum = parseInt(id_compte, 10);
    const idDossierNum = parseInt(id_dossier, 10);
    const idExerciceNum = parseInt(id_exercice, 10);

    // Construire la requête avec filtre de période si disponible
    let periodeFilter = '';
    if (idPeriode !== null) {
      periodeFilter = `AND a.id_periode = ${idPeriode}`;
    }

    console.log(`DEBUG - idPeriode:`, idPeriode);
    console.log(`DEBUG - periodeFilter:`, periodeFilter);

    const anomaliesRaw = await db.sequelize.query(`
      SELECT 
        a.id,
        a.id_compte,
        a.id_dossier,
        a.id_exercice,
        a.id_jnl,
        a.id_num_compte,
        a."codeCtrl",
        a.id_controle,
        a.message,
        a.id_periode,
        a."createdAt",
        a."updatedAt",
        c.valide as commentaire_valide,
        c.commentaire as commentaire_text,
        c.id_periode as commentaire_periode
        FROM table_controle_anomalies a
      LEFT JOIN revision_commentaire_anomalies c 
        ON a.id_controle = c.id_controle 
        AND a.id_jnl = c.id_jnl
        AND a.id_periode = c.id_periode 
        AND a.id_compte = c.id_compte 
        AND a.id_dossier = c.id_dossier 
        AND a.id_exercice = c.id_exercice
      WHERE a.id_compte = ${idCompteNum}
        AND a.id_dossier = ${idDossierNum}
        AND a.id_exercice = ${idExerciceNum}
        AND a.id_controle = '${id_controle}'
        ${periodeFilter}
      ORDER BY a.id ASC
    `, { type: db.Sequelize.QueryTypes.SELECT });

    // DEBUG: Afficher les résultats bruts de la requête SQL
    console.log('DEBUG SQL RAW RESULTS:', anomaliesRaw.map(r => ({
      id: r.id,
      commentaire_valide: r.commentaire_valide,
      commentaire_text: r.commentaire_text,
      commentaire_periode: r.commentaire_periode
    })));

    // Transformer les résultats pour avoir la structure attendue par le frontend
    const anomalies = anomaliesRaw.map(row => {
      const result = {
        id: row.id,
        id_compte: row.id_compte,
        id_dossier: row.id_dossier,
        id_exercice: row.id_exercice,
        id_jnl: row.id_jnl,
        id_num_compte: row.id_num_compte,
        codeCtrl: row.codeCtrl,
        id_controle: row.id_controle,
        message: row.message,
        id_periode: row.id_periode,  // ← CORRIGÉ : utiliser a.id_periode
        valide: row.commentaire_valide !== null ? row.commentaire_valide : false,
        commentaire: row.commentaire_text || '',
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };
      console.log(`DEBUG getAnomaliesByControle - Anomalie ${row.id}: id_periode=${result.id_periode}, valide=${result.valide}, commentaire="${result.commentaire}"`);
      return result;
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
        ...a,
        affichage,
        journalLines: lines,
        compteNum: compteNum
      };
    });

    if (controle?.Type === 'ATYPIQUE') {
      console.log('DEBUG ATYPIQUE FINAL - payload:', payload.map(p => ({ id: p.id, id_jnl: p.id_jnl, journalLinesCount: p.journalLines?.length })));
    }

    console.log('DEBUG FINAL RESPONSE - First anomaly:', payload[0] ? {
      id: payload[0].id,
      valide: payload[0].valide,
      commentaire: payload[0].commentaire,
      id_controle: payload[0].id_controle,
      id_jnl: payload[0].id_jnl
    } : 'No anomalies');

    console.log('DEBUG FINAL RESPONSE - Complete response:', {
      state: true,
      anomalies: payload,
      controle: controle ? controle.toJSON() : null,
      affichage,
      comptesList: (controle?.Type === 'SENS_SOLDE' || controle?.Type === 'SENS_ECRITURE' || controle?.Type === 'IMMO_CHARGE') ? comptesList : null,
      count: payload.length
    });

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

    // Si id_periode fourni, l'utiliser, sinon utiliser l'id_periode de l'anomalie existante ou chercher une période pour l'exercice si l'anomalie n'en a pas
    if (id_periode !== undefined) {
      updatePayload.id_periode = id_periode;
      console.log('id_periode fourni dans body:', id_periode);
    } else if (anomaly.id_periode) {
      // Utiliser l'id_periode de l'anomalie existante
      updatePayload.id_periode = anomaly.id_periode;
      console.log('Utilisation id_periode de l\'anomalie existante:', anomaly.id_periode);
    } else {
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
    }

    console.log('Update payload:', updatePayload);

    // Pour UTIL_CPT_TVA avec validateAllByEcriture=true, valider toutes les anomalies du même id_ecriture
    let updatedCount = 1;
    if (isUtilCptTva && validateAllByEcriture && typeof valide === 'boolean' && anomaly.id_jnl) {
      console.log(`UTIL_CPT_TVA - Validation groupée pour id_ecriture=${anomaly.id_jnl}`);

      // Récupérer toutes les anomalies du même id_ecriture
      const relatedAnomalies = await db.tableControleAnomalies.findAll({
        where: {
          id_compte,
          id_dossier,
          id_exercice,
          id_controle: anomaly.id_controle,
          id_jnl: anomaly.id_jnl
        }
      });

      // Insérer ou mettre à jour dans revision_commentaire_anomalies pour chaque anomalie
      for (const relAnomaly of relatedAnomalies) {
        try {
          const finalPeriodeId = id_periode || updatePayload.id_periode || null;
          const finalValide = typeof valide === 'boolean' ? valide : false;
          const finalCommentaire = (commentaire || '').replace(/'/g, "''");

          // Convertir les paramètres en nombres
          const idCompteNum = parseInt(id_compte, 10);
          const idDossierNum = parseInt(id_dossier, 10);
          const idExerciceNum = parseInt(id_exercice, 10);

          // Vérifier si un enregistrement existe déjà (par id_controle + id_jnl)
          const existing = await db.sequelize.query(`
            SELECT id FROM revision_commentaire_anomalies 
            WHERE id_compte = ${idCompteNum} 
              AND id_dossier = ${idDossierNum} 
              AND id_exercice = ${idExerciceNum}
              AND id_controle = '${relAnomaly.id_controle}'
              AND id_jnl = '${relAnomaly.id_jnl}'
          `, { type: db.Sequelize.QueryTypes.SELECT });

          if (existing.length > 0) {
            // UPDATE
            await db.sequelize.query(`
              UPDATE revision_commentaire_anomalies 
              SET valide = ${finalValide},
                  commentaire = '${finalCommentaire}',
                  id_periode = ${finalPeriodeId || 'NULL'},
                  "updatedAt" = NOW()
              WHERE id_compte = ${idCompteNum} 
                AND id_dossier = ${idDossierNum} 
                AND id_exercice = ${idExerciceNum}
                AND id_controle = '${relAnomaly.id_controle}'
                AND id_jnl = '${relAnomaly.id_jnl}'
            `);
          } else {
            // INSERT avec id_controle et id_jnl
            await db.sequelize.query(`
              INSERT INTO revision_commentaire_anomalies (
                id_compte, id_dossier, id_exercice, id_periode, id_controle, id_jnl, valide, commentaire, "createdAt", "updatedAt"
              ) VALUES (
                ${idCompteNum}, ${idDossierNum}, ${idExerciceNum}, ${finalPeriodeId || 'NULL'}, 
                '${relAnomaly.id_controle}', '${relAnomaly.id_jnl}',
                ${finalValide}, '${finalCommentaire}', NOW(), NOW()
              )
            `);
          }
          console.log(`Anomalie ${relAnomaly.id} (controle: ${relAnomaly.id_controle}, jnl: ${relAnomaly.id_jnl}) insérée/mise à jour avec succès`);
        } catch (insertError) {
          console.error(`Erreur insertion anomalie ${relAnomaly.id}:`, insertError.message);
          throw insertError;
        }
      }

      updatedCount = relatedAnomalies.length;
      console.log(`${updatedCount} anomalies mises à jour pour l'écriture ${anomaly.id_jnl}`);
    } else {
      // Mise à jour standard d'une seule anomalie
      try {
        const finalPeriodeId = id_periode || updatePayload.id_periode || null;
        // Convertir les paramètres en nombres pour la requête SQL
        const idCompteNum = parseInt(id_compte, 10);
        const idDossierNum = parseInt(id_dossier, 10);
        const idExerciceNum = parseInt(id_exercice, 10);

        // Récupérer les valeurs existantes d'abord
        const existingRecord = await db.sequelize.query(`
          SELECT valide, commentaire FROM revision_commentaire_anomalies 
          WHERE id_compte = ${idCompteNum} 
            AND id_dossier = ${idDossierNum} 
            AND id_exercice = ${idExerciceNum}
            AND id_controle = '${anomaly.id_controle}'
            AND id_jnl = '${anomaly.id_jnl}'
            AND id_periode = ${finalPeriodeId || 'NULL'}
        `, { type: db.Sequelize.QueryTypes.SELECT });

        const existingValide = existingRecord[0]?.valide;
        const existingCommentaire = existingRecord[0]?.commentaire;

        // Utiliser les valeurs existantes si non fournies
        const finalValide = typeof valide === 'boolean' ? valide : (existingValide !== undefined ? existingValide : false);
        const finalCommentaire = commentaire !== undefined ? commentaire : (existingCommentaire || '');

        console.log('UPSERT manuel avec valeurs:', {
          idCompteNum, idDossierNum, idExerciceNum,
          finalPeriodeId,
          id_controle: anomaly.id_controle,
          id_jnl: anomaly.id_jnl,
          finalValide,
          finalCommentaire
        });

        // Vérifier si un enregistrement existe déjà (par id_controle + id_jnl)
        const existing = await db.sequelize.query(`
          SELECT id FROM revision_commentaire_anomalies 
          WHERE id_compte = ${idCompteNum} 
            AND id_dossier = ${idDossierNum} 
            AND id_exercice = ${idExerciceNum}
            AND id_controle = '${anomaly.id_controle}'
            AND id_jnl = '${anomaly.id_jnl}'
            AND id_periode = ${finalPeriodeId || 'NULL'}
        `, { type: db.Sequelize.QueryTypes.SELECT });

        if (existing.length > 0) {
          // UPDATE
          await db.sequelize.query(`
            UPDATE revision_commentaire_anomalies 
            SET valide = ${finalValide},
                commentaire = '${finalCommentaire.replace(/'/g, "''")}',
                id_periode = ${finalPeriodeId || 'NULL'},
                "updatedAt" = NOW()
            WHERE id_compte = ${idCompteNum} 
              AND id_dossier = ${idDossierNum} 
              AND id_exercice = ${idExerciceNum}
              AND id_controle = '${anomaly.id_controle}'
              AND id_jnl = '${anomaly.id_jnl}'
              AND id_periode = ${finalPeriodeId || 'NULL'}
          `);
          console.log('Anomalie mise à jour avec UPDATE (par id_controle + id_jnl)');
        } else {
          // INSERT avec id_controle et id_jnl
          await db.sequelize.query(`
            INSERT INTO revision_commentaire_anomalies (
              id_compte, id_dossier, id_exercice, id_periode, id_controle, id_jnl, valide, commentaire, "createdAt", "updatedAt"
            ) VALUES (
              ${idCompteNum}, ${idDossierNum}, ${idExerciceNum}, ${finalPeriodeId || 'NULL'}, 
              '${anomaly.id_controle}', '${anomaly.id_jnl}',
              ${finalValide}, '${finalCommentaire.replace(/'/g, "''")}', NOW(), NOW()
            )
          `);
          console.log('Anomalie insérée avec INSERT (avec id_controle + id_jnl)');
        }
      } catch (insertError) {
        console.error('Erreur insertion anomalie:', insertError.message);
        console.error('SQL Error detail:', insertError);
        throw insertError;
      }
    }

    console.log('Update payload:', { valide, commentaire, id_periode });

    // Mettre à jour le compteur d'anomalies dans table_revisions_controles
    // Compter les anomalies non validées depuis la nouvelle table revision_commentaire_anomalies
    const updateControleQuery = `
      UPDATE table_revisions_controles
      SET anomalies = (
        SELECT COUNT(*) 
        FROM table_controle_anomalies a
        LEFT JOIN revision_commentaire_anomalies c 
          ON a.id_controle = c.id_controle 
          AND a.id_jnl = c.id_jnl
          AND a.id_compte = c.id_compte 
          AND a.id_dossier = c.id_dossier 
          AND a.id_exercice = c.id_exercice
          AND a.id_periode = c.id_periode
        WHERE a.id_compte = ${id_compte} 
          AND a.id_dossier = ${id_dossier} 
          AND a.id_exercice = ${id_exercice}
          AND a.id_controle = '${anomaly.id_controle}'
          AND (c.valide = false OR c.valide IS NULL)
      ),
      "Valider" = (
        SELECT CASE 
          WHEN COUNT(*) = 0 THEN true 
          WHEN COUNT(CASE WHEN c.valide = true THEN 1 END) = COUNT(*) THEN true 
          ELSE false 
        END
        FROM table_controle_anomalies a
        LEFT JOIN revision_commentaire_anomalies c 
          ON a.id_controle = c.id_controle 
          AND a.id_jnl = c.id_jnl
          AND a.id_compte = c.id_compte 
          AND a.id_dossier = c.id_dossier 
          AND a.id_exercice = c.id_exercice
          AND a.id_periode = c.id_periode
        WHERE a.id_compte = ${id_compte} 
          AND a.id_dossier = ${id_dossier} 
          AND a.id_exercice = ${id_exercice}
          AND a.id_controle = '${anomaly.id_controle}'
      )
      WHERE id_compte = ${id_compte}
        AND id_dossier = ${id_dossier}
        AND id_exercice = ${id_exercice}
        AND id_controle = '${anomaly.id_controle}'
    `;
    await db.sequelize.query(updateControleQuery, { type: db.Sequelize.QueryTypes.UPDATE });
    console.log('Compteur d\'anomalies et statut Valider mis à jour dans table_revisions_controles');

    // Récupérer les valeurs finales depuis revision_commentaire_anomalies pour la réponse
    const finalPeriodeId = id_periode || updatePayload.id_periode || null;
    const idCompteNum = parseInt(id_compte, 10);
    const idDossierNum = parseInt(id_dossier, 10);
    const idExerciceNum = parseInt(id_exercice, 10);

    const finalRecord = await db.sequelize.query(`
      SELECT valide, commentaire FROM revision_commentaire_anomalies 
      WHERE id_compte = ${idCompteNum} 
        AND id_dossier = ${idDossierNum} 
        AND id_exercice = ${idExerciceNum}
        AND id_controle = '${anomaly.id_controle}'
        AND id_jnl = '${anomaly.id_jnl}'
        AND id_periode = ${finalPeriodeId || 'NULL'}
    `, { type: db.Sequelize.QueryTypes.SELECT });

    const responseValide = finalRecord[0]?.valide !== undefined ? finalRecord[0].valide : false;
    const responseCommentaire = finalRecord[0]?.commentaire || '';

    return res.json({
      state: true,
      anomaly: {
        ...anomaly.toJSON(),
        valide: responseValide,
        commentaire: responseCommentaire,
        id_periode: finalPeriodeId
      },
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

// Valider/commenter une ligne par controle (pour SENS_SOLDE, SENS_ECRITURE qui n'ont pas d'id_anomalie individuel)
exports.validateLineAnomaly = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_controle } = req.params;
    const { id_jnl, valide, commentaire, id_periode } = req.body;

    console.log('=== VALIDATE LINE ANOMALY ===');
    console.log('Params:', { id_compte, id_dossier, id_exercice, id_controle });
    console.log('Body:', { id_jnl, valide, commentaire, id_periode });

    if (!id_jnl) {
      return res.status(400).json({
        state: false,
        message: 'id_jnl est requis dans le body'
      });
    }

    // Chercher l'anomalie par id_controle + id_jnl
    const anomaly = await db.tableControleAnomalies.findOne({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_controle,
        id_jnl
      }
    });

    if (!anomaly) {
      console.log('Anomalie non trouvée pour:', { id_controle, id_jnl });
      return res.status(404).json({
        state: false,
        message: 'Anomalie non trouvée pour ce contrôle et cette ligne'
      });
    }

    console.log('Anomalie trouvée:', { id: anomaly.id, id_jnl: anomaly.id_jnl, id_controle: anomaly.id_controle });

    // Simuler un appel à updateAnomaly avec l'id_anomalie trouvé
    req.params.id_anomalie = anomaly.id;
    
    // Appeler la fonction updateAnomaly existante
    return exports.updateAnomaly(req, res);

  } catch (error) {
    console.error('Error in validateLineAnomaly:', error);
    return res.status(500).json({
      state: false,
      message: 'Erreur lors de la validation de la ligne',
      error: error.message
    });
  }
};