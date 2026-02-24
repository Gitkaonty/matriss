const db = require('../../Models');
const { Op, Sequelize } = require('sequelize');

// Récupérer les contrôles de révision pour un exercice, et les créer s'ils n'existent pas
exports.getOrCreateRevisionControles = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice } = req.params;

    console.log('Getting or creating revision controles for:', { id_compte, id_dossier, id_exercice });

    // Vérifier si les contrôles existent déjà pour cet exercice (SQL)
    const existingQuery = `
      SELECT 
        c.*,
        m.anomalies as "matrix_anomalies"
      FROM table_revisions_controles c
      LEFT JOIN revisions_controles_matrices m 
        ON c.id_controle = m.id_controle AND c."Type" = m."Type"
      WHERE c.id_compte = ${id_compte} 
        AND c.id_dossier = ${id_dossier} 
        AND c.id_exercice = ${id_exercice}
    `;
    const existingControles = await db.sequelize.query(existingQuery, { type: db.Sequelize.QueryTypes.SELECT });

    // Si aucun contrôle n'existe, les créer à partir des matrices
    if (existingControles.length === 0) {
      console.log('No controles found, creating from matrices...');
      
      // Récupérer toutes les matrices (SQL)
      const matricesQuery = `SELECT * FROM revisions_controles_matrices`;
      const matrices = await db.sequelize.query(matricesQuery, { type: db.Sequelize.QueryTypes.SELECT });
      
      // Insérer les nouveaux contrôles
      const insertedControles = [];
      for (const matrix of matrices) {
        const insertQuery = `
          INSERT INTO table_revisions_controles (
            id_compte, id_dossier, id_exercice, id_controle, "Type", compte, test, 
            description, anomalies, details, "Valider", "Commentaire", "Affichage", "createdAt", "updatedAt"
          ) VALUES (
            ${id_compte}, ${id_dossier}, ${id_exercice}, '${matrix.id_controle}', 
            '${matrix.Type}', '${matrix.compte || ''}', '${matrix.test || ''}', 
            '${(matrix.description || '').replace(/'/g, "''")}', 0, '${(matrix.details || '').replace(/'/g, "''")}', 
            ${matrix.Valider || false}, '${(matrix.Commentaire || '').replace(/'/g, "''")}', 
            '${matrix.Affichage || 'ligne'}', NOW(), NOW()
          )
          RETURNING *
        `;
        const [newControle] = await db.sequelize.query(insertQuery, { type: db.Sequelize.QueryTypes.INSERT });
        // Ajouter matrix_anomalies au contrôle retourné
        newControle.matrix_anomalies = matrix.anomalies;
        insertedControles.push(newControle);
      }

      console.log(`Created ${insertedControles.length} controles from matrices`);

      res.json({
        state: true,
        controles: insertedControles,
        message: 'Contrôles créés automatiquement à partir des matrices'
      });
    } else {
      console.log(`Found ${existingControles.length} existing controles`);

      res.json({
        state: true,
        controles: existingControles,
        message: 'Contrôles existants récupérés'
      });
    }
  } catch (error) {
    console.error('Error in getOrCreateRevisionControles:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la récupération/création des contrôles de révision'
    });
  }
};

// Récupérer les contrôles par Type avec leurs comptes
exports.getControlesByType = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, type } = req.params;

    console.log('Getting controles by type:', { id_compte, id_dossier, id_exercice, type });

    const controles = await db.sequelize.query(`
      SELECT 
        c.*,
        CASE 
          WHEN c.compte IS NOT NULL AND LENGTH(c.compte) >= 2 
          THEN SUBSTRING(c.compte, 1, 2) 
          ELSE NULL 
        END as "comptePrefix",
        m.anomalies as "matrix_anomalies"
      FROM table_revisions_controles c
      LEFT JOIN revisions_controles_matrices m 
        ON c.id_controle = m.id_controle AND c."Type" = m."Type"
      WHERE c.id_compte = ${id_compte}
        AND c.id_dossier = ${id_dossier}
        AND c.id_exercice = ${id_exercice}
        AND c."Type" = '${type}'
    `, { type: db.Sequelize.QueryTypes.SELECT });

    res.json({
      state: true,
      controles: controles,
      count: controles.length
    });
  } catch (error) {
    console.error('Error in getControlesByType:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la récupération des contrôles par type'
    });
  }
};

// Récupérer les écritures du journal par préfixes de compte
exports.getJournalEcrituresByComptePrefix = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice } = req.params;
    const { prefixes } = req.query; // Tableau de préfixes: ["53", "60", "40"]

    // console.log('Getting journal ecritures:', { id_compte, id_dossier, id_exercice, prefixes });

    if (!prefixes || prefixes.length === 0) {
      return res.json({
        state: true,
        ecritures: [],
        message: 'Aucun préfixe fourni'
      });
    }

    // Construire les conditions LIKE pour chaque préfixe (SQL)
    const prefixArray = Array.isArray(prefixes) ? prefixes : [prefixes];
    const likeConditions = prefixArray.map(prefix => 
      `(comptegen LIKE '${prefix}%' OR compteaux LIKE '${prefix}%')`
    ).join(' OR ');

    const query = `
      SELECT * FROM journals
      WHERE id_compte = ${id_compte}
        AND id_dossier = ${id_dossier}
        AND id_exercice = ${id_exercice}
        AND (${likeConditions})
      ORDER BY dateecriture ASC
    `;

    const ecritures = await db.sequelize.query(query, { type: db.Sequelize.QueryTypes.SELECT });

    res.json({
      state: true,
      ecritures: ecritures,
      count: ecritures.length
    });
  } catch (error) {
    console.error('Error in getJournalEcrituresByComptePrefix:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la récupération des écritures du journal'
    });
  }
};

// Exécuter le contrôle pour un Type (lier les écritures aux contrôles)
exports.executeControle = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, type } = req.params;

    console.log('Executing controle:', { id_compte, id_dossier, id_exercice, type });

    // 1. Récupérer tous les contrôles de ce Type (SQL)
    const controlesQuery = `
      SELECT * FROM table_revisions_controles
      WHERE id_compte = ${id_compte}
        AND id_dossier = ${id_dossier}
        AND id_exercice = ${id_exercice}
        AND "Type" = '${type}'
    `;
    const controles = await db.sequelize.query(controlesQuery, { type: db.Sequelize.QueryTypes.SELECT });

    if (controles.length === 0) {
      return res.status(404).json({
        state: false,
        message: 'Aucun contrôle trouvé pour ce type'
      });
    }

    // 2. Extraire les préfixes de compte uniques
    const prefixes = [...new Set(
      controles
        .filter(c => c.compte && c.compte.length >= 2)
        .map(c => c.compte.substring(0, 2))
    )];

    if (prefixes.length === 0) {
      return res.json({
        state: true,
        message: 'Aucun compte associé à ces contrôles',
        ecrituresLiees: 0
      });
    }

    // 3. Chercher les écritures du journal correspondant aux préfixes (SQL)
    const likeConditions = prefixes.map(prefix => 
      `(comptegen LIKE '${prefix}%' OR compteaux LIKE '${prefix}%')`
    ).join(' OR ');

    const ecrituresQuery = `
      SELECT * FROM journals
      WHERE id_compte = ${id_compte}
        AND id_dossier = ${id_dossier}
        AND id_exercice = ${id_exercice}
        AND (${likeConditions})
    `;
    const ecritures = await db.sequelize.query(ecrituresQuery, { type: db.Sequelize.QueryTypes.SELECT });

    // 4. Lier chaque écriture au bon contrôle
    let ecrituresLiees = 0;
    for (const ecriture of ecritures) {
      // Trouver le contrôle correspondant (par préfixe de compte)
      const compteEcriture = ecriture.comptegen || ecriture.compteaux || '';
      const prefixEcriture = compteEcriture.substring(0, 2);
      
      const controleCorrespondant = controles.find(c => 
        c.compte && c.compte.substring(0, 2) === prefixEcriture
      );

      if (controleCorrespondant) {
        const updateQuery = `
          UPDATE journals
          SET id_revision_controle = ${controleCorrespondant.id}
          WHERE id = ${ecriture.id}
        `;
        await db.sequelize.query(updateQuery, { type: db.Sequelize.QueryTypes.UPDATE });
        ecrituresLiees++;
      }
    }

    // 5. Mettre à jour le nombre d'anomalies pour chaque contrôle (SQL)
    for (const controle of controles) {
      const countQuery = `
        SELECT COUNT(*) as count FROM journals
        WHERE id_revision_controle = ${controle.id}
      `;
      const [result] = await db.sequelize.query(countQuery, { type: db.Sequelize.QueryTypes.SELECT });
      const countEcritures = parseInt(result.count, 10);
      
      const updateControleQuery = `
        UPDATE table_revisions_controles
        SET anomalies = ${countEcritures}
        WHERE id = ${controle.id}
      `;
      await db.sequelize.query(updateControleQuery, { type: db.Sequelize.QueryTypes.UPDATE });
    }

    // 6. Récupérer les écritures liées pour affichage (SQL)
    const controlesIds = controles.map(c => c.id).join(',');
    const ecrituresLieesQuery = `
      SELECT * FROM journals
      WHERE id_compte = ${id_compte}
        AND id_dossier = ${id_dossier}
        AND id_exercice = ${id_exercice}
        AND id_revision_controle IN (${controlesIds})
      ORDER BY dateecriture ASC
    `;
    const ecrituresLieesData = await db.sequelize.query(ecrituresLieesQuery, { type: db.Sequelize.QueryTypes.SELECT });

    res.json({
      state: true,
      message: 'Contrôle exécuté avec succès',
      ecrituresLiees: ecrituresLiees,
      controlesCount: controles.length,
      prefixesUtilises: prefixes,
      ecritures: ecrituresLieesData
    });
  } catch (error) {
    console.error('Error in executeControle:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de l\'exécution du contrôle'
    });
  }
};

// Exécuter le contrôle global (reset + recopie + détecter anomalies)
exports.executeAll = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice } = req.params;
    const { date_debut, date_fin } = req.query; // Dates de période optionnelles

    console.log('=== DEBUG executeAll ===');
    console.log('Params reçus:', { id_compte, id_dossier, id_exercice });
    console.log('Query params date_debut:', date_debut);
    console.log('Query params date_fin:', date_fin);

    // Construire la condition de date si une période est sélectionnée
    let dateCondition = '';
    if (date_debut && date_fin) {
      dateCondition = `AND dateecriture >= '${date_debut}' AND dateecriture <= '${date_fin}'`;
      console.log('Période sélectionnée - dateCondition:', dateCondition);
    } else {
      console.log('Aucune période sélectionnée - filtre sur tout l\'exercice');
    }
    console.log('=======================');

    // 1. Sauvegarder les anomalies existantes avec leurs validations/commentaires
    const existingAnomaliesQuery = `
      SELECT id_jnl, id_controle, valide, commentaire, id_periode 
      FROM table_controle_anomalies 
      WHERE id_compte = ${id_compte}
        AND id_dossier = ${id_dossier}
        AND id_exercice = ${id_exercice}
    `;
    const existingAnomalies = await db.sequelize.query(existingAnomaliesQuery, { type: db.Sequelize.QueryTypes.SELECT });
    const anomaliesMap = {};
    for (const anomalie of existingAnomalies) {
      const key = `${anomalie.id_jnl}_${anomalie.id_controle}`;
      anomaliesMap[key] = {
        valide: anomalie.valide,
        commentaire: anomalie.commentaire,
        id_periode: anomalie.id_periode
      };
    }
    console.log(`Sauvegarde de ${existingAnomalies.length} anomalies existantes`);
    console.log('DEBUG - Clés sauvegardées:', Object.keys(anomaliesMap).slice(0, 5));

    // 2. débit suppérieur àrimer les anciens contrôles pour cet exercice + nettoyer controle_anomalies (SQL)
    await db.sequelize.query(`
      DELETE FROM table_revisions_controles
      WHERE id_compte = ${id_compte}
        AND id_dossier = ${id_dossier}
        AND id_exercice = ${id_exercice}
    `, { type: db.Sequelize.QueryTypes.DELETE });
    
    await db.sequelize.query(`
      DELETE FROM table_controle_anomalies
      WHERE id_compte = ${id_compte}
        AND id_dossier = ${id_dossier}
        AND id_exercice = ${id_exercice}
    `, { type: db.Sequelize.QueryTypes.DELETE });
    console.log('Old controles and anomalies deleted');

    // 2. Recopier depuis la matrice (avec Affichage) (SQL)
    const matricesQuery = `SELECT * FROM revisions_controles_matrices`;
    const matrices = await db.sequelize.query(matricesQuery, { type: db.Sequelize.QueryTypes.SELECT });
    
    const newControles = [];
    for (const matrix of matrices) {
      const insertQuery = `
        INSERT INTO table_revisions_controles (
          id_compte, id_dossier, id_exercice, id_controle, "Type", compte, test,
          description, anomalies, details, "Valider", "Commentaire", "Affichage", "createdAt", "updatedAt"
        ) VALUES (
          ${id_compte}, ${id_dossier}, ${id_exercice}, '${matrix.id_controle}',
          '${matrix.Type}', '${matrix.compte || ''}', '${matrix.test || ''}',
          '${(matrix.description || '').replace(/'/g, "''")}', 0, '${(matrix.details || '').replace(/'/g, "''")}',
          ${matrix.Valider || false}, '${(matrix.Commentaire || '').replace(/'/g, "''")}',
          '${matrix.Affichage || 'ligne'}', NOW(), NOW()
        )
        RETURNING *
      `;
      const [newControle] = await db.sequelize.query(insertQuery, { type: db.Sequelize.QueryTypes.INSERT });
      newControles.push(newControle);
    }
    console.log(`Created ${newControles.length} controles from matrices`);

    // 3. Grouper les contrôles par Type
    const controlesByType = {};
    console.log('First controle object:', newControles[0]);
    console.log('First controle keys:', Object.keys(newControles[0]));
    for (const controleWrapper of newControles) {
      // Le résultat de la requête SQL est un tableau, prendre le premier élément
      const controle = Array.isArray(controleWrapper) ? controleWrapper[0] : controleWrapper;
      const type = controle["Type"];
      console.log(`Controle ${controle.id}: type=${type}`);
      if (!controlesByType[type]) {
        controlesByType[type] = [];
      }
      controlesByType[type].push(controle);
    }

    // 4. Exécuter le contrôle pour chaque Type
    const resultsByType = {};

    // Rechercher la période correspondante si dates fournies
    let idPeriode = null;
    if (date_debut && date_fin) {
      const periodeQuery = `
        SELECT id FROM periodes 
        WHERE id_compte = ${id_compte} 
          AND id_dossier = ${id_dossier} 
          AND id_exercice = ${id_exercice}
          AND date_debut >= '${date_debut}' 
          AND date_fin <= '${date_fin}'
        ORDER BY date_debut ASC
        LIMIT 1
      `;
      const periodeResult = await db.sequelize.query(periodeQuery, { type: db.Sequelize.QueryTypes.SELECT });
      if (periodeResult.length > 0) {
        idPeriode = periodeResult[0].id;
        console.log('Période trouvée:', idPeriode);
      } else {
        console.log('Aucune période trouvée pour les dates:', date_debut, 'à', date_fin);
      }
    }

    for (const [type, controles] of Object.entries(controlesByType)) {
      console.log(`Processing type: ${type}, controles: ${controles.length}`);
      
      let anomaliesDetectees = [];

      // ===== CONTRÔLE EXISTENCE =====
      if (type === 'EXISTENCE') {
        for (const controle of controles) {
          const comptePrefix = controle.compte ? controle.compte.substring(0, 3) : null;
          
          if (!comptePrefix) continue;

          // Vérifier si des écritures existent pour ce compte (SQL)
          const ecrituresExistQuery = `
            SELECT 1 FROM journals
            WHERE id_compte = ${id_compte}
              AND id_dossier = ${id_dossier}
              AND id_exercice = ${id_exercice}
              AND (comptegen LIKE '${comptePrefix}%' OR compteaux LIKE '${comptePrefix}%')
              ${dateCondition}
            LIMIT 1
          `;
          const ecrituresExist = await db.sequelize.query(ecrituresExistQuery, { type: db.Sequelize.QueryTypes.SELECT });

          if (ecrituresExist.length === 0) {
            const messageAnomalie = `Le compte ${controle.compte} n'existe pas - Aucune écriture trouvée`;
            anomaliesDetectees.push({
              controleId: controle.id,
              compte: controle.compte,
              message: messageAnomalie
            });
            
            // Récupérer les données sauvegardées si elles existent
            const key = `${controle.compte}_${controle.id_controle}`;
            const savedData = anomaliesMap[key] || {};
            const valide = savedData.valide || false;
            const commentaire = savedData.commentaire || '';
            const periodeId = savedData.id_periode || idPeriode || 'NULL';
            
            // Insérer dans table_controle_anomalies pour EXISTENCE
            const insertExistenceQuery = `
              INSERT INTO table_controle_anomalies (
                id_compte, id_dossier, id_exercice, id_jnl, "codeCtrl", id_controle, message, 
                valide, commentaire, id_periode, "createdAt", "updatedAt"
              ) VALUES (
                ${id_compte}, ${id_dossier}, ${id_exercice}, '${controle.compte}', '${type}', 
                '${controle.id_controle}', '${messageAnomalie.replace(/'/g, "''")}', 
                ${valide}, '${(commentaire || '').replace(/'/g, "''")}', ${periodeId}, NOW(), NOW()
              )
              ON CONFLICT (id_compte, id_dossier, id_exercice, id_jnl, id_controle) DO NOTHING
            `;
            await db.sequelize.query(insertExistenceQuery, { type: db.Sequelize.QueryTypes.INSERT });
            
            // Update controle (SQL)
            await db.sequelize.query(`
              UPDATE table_revisions_controles
              SET anomalies = 1,
                  details = '${JSON.stringify([{ anomalie: messageAnomalie }]).replace(/'/g, "''")}'
              WHERE id = ${controle.id}
            `, { type: db.Sequelize.QueryTypes.UPDATE });
          } else {
            // Update controle (SQL)
            await db.sequelize.query(`
              UPDATE table_revisions_controles
              SET anomalies = 0,
                  details = '${JSON.stringify([{ message: 'Compte existant - pas d\'anomalie' }]).replace(/'/g, "''")}'
              WHERE id = ${controle.id}
            `, { type: db.Sequelize.QueryTypes.UPDATE });
          }
        }
      }
      // ===== CONTRÔLE SENS_SOLDE =====
      else if (type === 'SENS_SOLDE') {
        // Récupérer toutes les écritures pour les comptes concernés (SQL)
        const comptesPrefixes = [...new Set(
          controles
            .filter(c => c.compte && c.compte.length >= 2)
            .map(c => c.compte.substring(0, 2))
        )];

        if (comptesPrefixes.length === 0) continue;

        // Construire les conditions pour chercher les écritures (SQL)
        const likeConditions = comptesPrefixes.map(prefix => 
          `(comptegen LIKE '${prefix}%' OR compteaux LIKE '${prefix}%')`
        ).join(' OR ');

        const ecrituresQuery = `
          SELECT * FROM journals
          WHERE id_compte = ${id_compte}
            AND id_dossier = ${id_dossier}
            AND id_exercice = ${id_exercice}
            AND (${likeConditions})
            ${dateCondition}
        `;
        console.log('DEBUG SENS_SOLDE - ecrituresQuery:', ecrituresQuery);
        const ecritures = await db.sequelize.query(ecrituresQuery, { type: db.Sequelize.QueryTypes.SELECT });
        console.log('DEBUG SENS_SOLDE - Nombre écritures:', ecritures.length);
        
        // Log des dates pour vérifier le filtre
        if (ecritures.length > 0) {
          const dates = ecritures.map(e => e.dateecriture).sort();
          console.log('DEBUG SENS_SOLDE - dateCondition utilisée:', dateCondition || 'AUCUNE (tout l\'exercice)');
          console.log('DEBUG SENS_SOLDE - Première date écriture:', dates[0]);
          console.log('DEBUG SENS_SOLDE - Dernière date écriture:', dates[dates.length - 1]);
        }

        // Grouper les écritures par compte complet (4-6 caractères)
        const ecrituresByCompte = {};
        for (const ecriture of ecritures) {
          const compte = ecriture.comptegen || ecriture.compteaux;
          if (!compte) continue;
          
          if (!ecrituresByCompte[compte]) {
            ecrituresByCompte[compte] = [];
          }
          ecrituresByCompte[compte].push(ecriture);
        }

        // Calculer le solde pour chaque compte et vérifier les anomalies
        for (const [compte, ecrituresCompte] of Object.entries(ecrituresByCompte)) {
          const totalDebit = ecrituresCompte.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
          const totalCredit = ecrituresCompte.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
          const solde = totalDebit - totalCredit;

          // Trouver le contrôle correspondant (par préfixe)
          const comptePrefix = compte.substring(0, 2);
          const controle = controles.find(c => 
            c.compte && c.compte.substring(0, 2) === comptePrefix
          );

          if (!controle) continue;

          const testType = controle.test ? controle.test.toUpperCase() : null;
          let anomalieMessage = null;

          // Normaliser le solde pour éviter -0.00
          const soldeNormalise = Math.abs(solde) < 0.01 ? 0 : solde;

          // anomalies - utiliser soldeNormalise pour les conditions aussi
          if (testType === 'DEBITEUR' && soldeNormalise < 0) {
            anomalieMessage = `Le compte "${compte}" doit avoir un solde débiteur (solde actuel: ${soldeNormalise.toFixed(2)})`;
          } else if (testType === 'CREDITEUR' && soldeNormalise > 0) {
            anomalieMessage = `Le compte "${compte}" doit avoir un solde créditeur (solde actuel: ${soldeNormalise.toFixed(2)})`;
          } else if (testType === 'NULL' && soldeNormalise !== 0) {
            anomalieMessage = `Le compte "${compte}" doit avoir un solde nul (solde actuel: ${soldeNormalise.toFixed(2)})`;
          }

          if (anomalieMessage) {
            anomaliesDetectees.push({
              controleId: controle.id,
              compte: compte,
              test: testType,
              solde: solde,
              soldeNormalise: soldeNormalise,
              message: anomalieMessage
            });

            // Récupérer les données sauvegardées si elles existent
            const key = `${compte}_${controle.id_controle}`;
            const savedData = anomaliesMap[key] || {};
            
            console.log(`DEBUG - Recherche clé: ${key}, Trouvé:`, !!savedData.valide, 'valide:', savedData.valide);
            
            const valide = savedData.valide || false;
            const commentaire = savedData.commentaire || '';
            const periodeId = savedData.id_periode || idPeriode || 'NULL';

            // Insérer dans table_controle_anomalies - SQL pour SENS_SOLDE avec données préservées
            const messageSimple = controle.message || `Anomalie de solde pour le compte ${compte}`;
            const insertQuery = `
              INSERT INTO table_controle_anomalies (
                id_compte, id_dossier, id_exercice, id_jnl, "codeCtrl", id_controle, message, 
                valide, commentaire, id_periode, "createdAt", "updatedAt"
              ) VALUES (
                ${id_compte}, ${id_dossier}, ${id_exercice}, '${compte}', '${type}', 
                '${controle.id_controle}', '${messageSimple.replace(/'/g, "''")}', 
                ${valide}, '${(commentaire || '').replace(/'/g, "''")}', ${periodeId}, NOW(), NOW()
              )
              ON CONFLICT (id_compte, id_dossier, id_exercice, id_jnl, id_controle) DO NOTHING
            `;
            await db.sequelize.query(insertQuery, { type: db.Sequelize.QueryTypes.INSERT });
            console.log(`DEBUG - Insertion anomalie: compte=${compte}, valide=${valide}`);
          }
        }

        // Mettre à jour les contrôles avec les anomalies (SQL)
        for (const controle of controles) {
          const anomaliesControle = anomaliesDetectees.filter(a => a.controleId === controle.id);
          const detailsJson = anomaliesControle.length > 0 
            ? JSON.stringify(anomaliesControle).replace(/'/g, "''")
            : JSON.stringify([{ message: 'Pas d\'anomalie détectée' }]).replace(/'/g, "''");
          
          const updateQuery = `
            UPDATE table_revisions_controles
            SET anomalies = '${anomaliesControle.length}',
                details = '${detailsJson}'
            WHERE id = ${controle.id}
          `;
          await db.sequelize.query(updateQuery, { type: db.Sequelize.QueryTypes.UPDATE });
        }
      }

      // ===== CONTRÔLE SENS_ECRITURE =====
      else if (type === 'SENS_ECRITURE') {
        // Récupérer les préfixes de comptes concernés
        const comptesPrefixes = [...new Set(
          controles
            .filter(c => c.compte && c.compte.length >= 2)
            .map(c => c.compte.substring(0, 2))
        )];

        if (comptesPrefixes.length === 0) continue;

        // Construire les conditions pour chercher les écritures (SQL)
        const likeConditions = comptesPrefixes.map(prefix => 
          `(comptegen LIKE '${prefix}%' OR compteaux LIKE '${prefix}%')`
        ).join(' OR ');

        const ecrituresQuery = `
          SELECT * FROM journals
          WHERE id_compte = ${id_compte}
            AND id_dossier = ${id_dossier}
            AND id_exercice = ${id_exercice}
            AND (${likeConditions})
            ${dateCondition}
        `;
        console.log('DEBUG SENS_ECRITURE - ecrituresQuery:', ecrituresQuery);
        const ecritures = await db.sequelize.query(ecrituresQuery, { type: db.Sequelize.QueryTypes.SELECT });
        console.log('DEBUG SENS_ECRITURE - Nombre écritures:', ecritures.length);
        
        // Log des dates pour vérifier le filtre
        if (ecritures.length > 0) {
          const dates = ecritures.map(e => e.dateecriture).sort();
          console.log('DEBUG SENS_ECRITURE - dateCondition utilisée:', dateCondition || 'AUCUNE (tout l\'exercice)');
          console.log('DEBUG SENS_ECRITURE - Première date écriture:', dates[0]);
          console.log('DEBUG SENS_ECRITURE - Dernière date écriture:', dates[dates.length - 1]);
        }

        // Grouper les écritures par compte complet
        const ecrituresByCompte = {};
        for (const ecriture of ecritures) {
          const compte = ecriture.comptegen || ecriture.compteaux;
          if (!compte) continue;
          
          if (!ecrituresByCompte[compte]) {
            ecrituresByCompte[compte] = [];
          }
          ecrituresByCompte[compte].push(ecriture);
        }

        // Vérifier chaque compte - une seule anomalie par compte
        for (const [compte, ecrituresCompte] of Object.entries(ecrituresByCompte)) {
          // Trouver le contrôle correspondant
          const comptePrefix = compte.substring(0, 2);
          const controle = controles.find(c => 
            c.compte && c.compte.substring(0, 2) === comptePrefix
          );

          if (!controle) continue;

          const testType = controle.test ? controle.test.toUpperCase() : null;
          
          // Calculer totaux pour ce compte
          const totalDebit = ecrituresCompte.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
          const totalCredit = ecrituresCompte.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
          
          // Trouver les lignes anormales selon le test
          let lignesAnormales = [];
          if (testType === 'CREDIT') {
            lignesAnormales = ecrituresCompte.filter(e => (parseFloat(e.credit) || 0) > 0);
          } else if (testType === 'DEBIT') {
            lignesAnormales = ecrituresCompte.filter(e => (parseFloat(e.debit) || 0) > 0);
          }

          console.log(`SENS_ECRITURE - Compte ${compte}, test=${testType}, lignesAnormales=${lignesAnormales.length}`);
          if (lignesAnormales.length > 0) {
            console.log(`SENS_ECRITURE - Lignes anormales:`, lignesAnormales.map(l => ({id: l.id, debit: l.debit, credit: l.credit})));
          }

          // Ne créer l'anomalie que s'il y a des lignes anormales
          if (lignesAnormales.length > 0) {
            const messageSimple = controle.message || `Anomalie de sens d'imputation pour le compte ${compte}`;
            
            anomaliesDetectees.push({
              controleId: controle.id,
              compte: compte,
              test: testType,
              nbLignesAnormales: lignesAnormales.length,
              message: messageSimple
            });

            // Récupérer les données sauvegardées si elles existent
            const key = `${compte}_${controle.id_controle}`;
            const savedData = anomaliesMap[key] || {};
            const valide = savedData.valide || false;
            const commentaire = savedData.commentaire || '';
            const periodeId = savedData.id_periode || idPeriode || 'NULL';

            // Insérer dans table_controle_anomalies avec données préservées
            const insertQuerySensEcriture = `
              INSERT INTO table_controle_anomalies (
                id_compte, id_dossier, id_exercice, id_jnl, "codeCtrl", id_controle, message, 
                valide, commentaire, id_periode, "createdAt", "updatedAt"
              ) VALUES (
                ${id_compte}, ${id_dossier}, ${id_exercice}, '${compte}', '${type}',
                '${controle.id_controle}', '${messageSimple.replace(/'/g, "''")}', 
                ${valide}, '${(commentaire || '').replace(/'/g, "''")}', ${periodeId}, NOW(), NOW()
              )
              ON CONFLICT (id_compte, id_dossier, id_exercice, id_jnl, id_controle) DO NOTHING
            `;
            await db.sequelize.query(insertQuerySensEcriture, { type: db.Sequelize.QueryTypes.INSERT });
          }
        }

        // Mettre à jour les contrôles avec les anomalies (SQL)
        for (const controle of controles) {
          const anomaliesControle = anomaliesDetectees.filter(a => a.controleId === controle.id);
          const detailsJsonEcriture = anomaliesControle.length > 0
            ? JSON.stringify(anomaliesControle).replace(/'/g, "''")
            : JSON.stringify([{ message: 'Pas d\'anomalie détectée' }]).replace(/'/g, "''");

          const updateQueryEcriture = `
            UPDATE table_revisions_controles
            SET anomalies = ${anomaliesControle.length},
                details = '${detailsJsonEcriture}'
            WHERE id = ${controle.id}
          `;
          await db.sequelize.query(updateQueryEcriture, { type: db.Sequelize.QueryTypes.UPDATE });
        }
      }

      // ===== CONTRÔLE IMMO_CHARGE =====
      else if (type === 'IMMO_CHARGE') {
        const SEUIL_CAPITALISATION = 500;
        const messageAnomalie = "Non-conformité dans l'application des règles de capitalisation des immobilisations";
        
        // Récupérer les écritures pour les comptes 20xx, 21xx (immobilisations)
        const immoQuery = `
          SELECT j.*
          FROM journals j
          WHERE j.id_compte = ${id_compte}
            AND j.id_dossier = ${id_dossier}
            AND j.id_exercice = ${id_exercice}
            AND (j.comptegen LIKE '20%' OR j.comptegen LIKE '21%' OR j.compteaux LIKE '20%' OR j.compteaux LIKE '21%')
            ${dateCondition}
        `;
        const ecrituresImmo = await db.sequelize.query(immoQuery, { type: db.Sequelize.QueryTypes.SELECT });
        
        // Récupérer les écritures pour les comptes 60xx-63xx (charges)
        const chargesQuery = `
          SELECT j.*
          FROM journals j
          WHERE j.id_compte = ${id_compte}
            AND j.id_dossier = ${id_dossier}
            AND j.id_exercice = ${id_exercice}
            AND (j.comptegen LIKE '60%' OR j.comptegen LIKE '61%' OR j.comptegen LIKE '62%' OR j.comptegen LIKE '63%'
                 OR j.compteaux LIKE '60%' OR j.compteaux LIKE '61%' OR j.compteaux LIKE '62%' OR j.compteaux LIKE '63%')
            ${dateCondition}
        `;
        const ecrituresCharges = await db.sequelize.query(chargesQuery, { type: db.Sequelize.QueryTypes.SELECT });
        
        // Vérifier les immobilisations avec montants < 500 (solde débiteur)
        const ecrituresImmoAnormales = ecrituresImmo.filter(e => {
          const montant = (parseFloat(e.debit) || 0) - (parseFloat(e.credit) || 0);
          return montant > 0 && montant < SEUIL_CAPITALISATION;
        });
        
        // Vérifier les charges avec débit > 500
        const ecrituresChargesAnormales = ecrituresCharges.filter(e => {
          const debit = parseFloat(e.debit) || 0;
          return debit > SEUIL_CAPITALISATION;
        });
        
        console.log(`IMMO_CHARGE - ${ecrituresImmoAnormales.length} immobilisations < ${SEUIL_CAPITALISATION}, ${ecrituresChargesAnormales.length} charges > ${SEUIL_CAPITALISATION}`);
        
        // Fonction pour récupérer toutes les lignes d'une écriture
        const getEcritureComplete = async (idEcriture) => {
          const query = `
            SELECT j.*
            FROM journals j
            WHERE j.id_compte = ${id_compte}
              AND j.id_dossier = ${id_dossier}
              AND j.id_exercice = ${id_exercice}
              AND j.id_ecriture = '${idEcriture}'
            ORDER BY j.id
          `;
          return await db.sequelize.query(query, { type: db.Sequelize.QueryTypes.SELECT });
        };

        // Regrouper les écritures anormales par compte
        const comptesImmoAnormaux = {};
        for (const ecriture of ecrituresImmoAnormales) {
          const compte = ecriture.comptegen || ecriture.compteaux;
          if (!comptesImmoAnormaux[compte]) {
            comptesImmoAnormaux[compte] = [];
          }
          comptesImmoAnormaux[compte].push(ecriture);
        }

        const comptesChargesAnormaux = {};
        for (const ecriture of ecrituresChargesAnormales) {
          const compte = ecriture.comptegen || ecriture.compteaux;
          if (!comptesChargesAnormaux[compte]) {
            comptesChargesAnormaux[compte] = [];
          }
          comptesChargesAnormaux[compte].push(ecriture);
        }

        // Traiter les anomalies d'immobilisations (par compte)
        for (const [compte, ecritures] of Object.entries(comptesImmoAnormaux)) {
          const montant = ecritures.reduce((sum, e) => sum + ((parseFloat(e.debit) || 0) - (parseFloat(e.credit) || 0)), 0);
          const key = `${compte}_${controles[0]?.id_controle || 'IMMO_CHARGE'}`;
          const savedData = anomaliesMap[key] || {};
          
          // Récupérer l'écriture complète de la première écriture
          const ecritureComplete = await getEcritureComplete(ecritures[0].id_ecriture);
          
          anomaliesDetectees.push({
            controleId: controles[0]?.id,
            compte: compte,
            montant: montant,
            type: 'IMMO_INSUFFISANT',
            message: `${messageAnomalie} - Immobilisation ${compte} inf a ${SEUIL_CAPITALISATION}`,
            ecritureComplete: ecritureComplete,
            ligneAnormale: ecritures[0]
          });
          
          // Insérer dans table_controle_anomalies
          const insertQuery = `
            INSERT INTO table_controle_anomalies (
              id_compte, id_dossier, id_exercice, id_jnl, "codeCtrl", id_controle, message, 
              valide, commentaire, id_periode, "createdAt", "updatedAt"
            ) VALUES (
              ${id_compte}, ${id_dossier}, ${id_exercice}, '${compte}', '${type}', 
              '${controles[0]?.id_controle || 'IMMO_CHARGE'}', '${messageAnomalie.replace(/'/g, "''")} - Immobilisation ${compte}: inf a ${SEUIL_CAPITALISATION}', 
              ${savedData.valide || false}, '${(savedData.commentaire || '').replace(/'/g, "''")}', ${savedData.id_periode || idPeriode || 'NULL'}, NOW(), NOW()
            )
            ON CONFLICT (id_compte, id_dossier, id_exercice, id_jnl, id_controle) DO NOTHING
          `;
          await db.sequelize.query(insertQuery, { type: db.Sequelize.QueryTypes.INSERT });
        }
        
        // Traiter les anomalies de charges (par compte)
        for (const [compte, ecritures] of Object.entries(comptesChargesAnormaux)) {
          const montant = ecritures.reduce((sum, e) => sum + ((parseFloat(e.debit) || 0) - (parseFloat(e.credit) || 0)), 0);
          const key = `${compte}_${controles[0]?.id_controle || 'IMMO_CHARGE'}`;
          const savedData = anomaliesMap[key] || {};
          
          // Récupérer l'écriture complète de la première écriture
          const ecritureComplete = await getEcritureComplete(ecritures[0].id_ecriture);
          
          anomaliesDetectees.push({
            controleId: controles[0]?.id,
            compte: compte,
            montant: montant,
            type: 'CHARGE_A_CAPITALISER',
            message: `${messageAnomalie} - Charge ${compte} débit suppérieur à ${SEUIL_CAPITALISATION}`,
            ecritureComplete: ecritureComplete,
            ligneAnormale: ecritures[0]
          });
          
          // Insérer dans table_controle_anomalies
          const insertQuery = `
            INSERT INTO table_controle_anomalies (
              id_compte, id_dossier, id_exercice, id_jnl, "codeCtrl", id_controle, message, 
              valide, commentaire, id_periode, "createdAt", "updatedAt"
            ) VALUES (
              ${id_compte}, ${id_dossier}, ${id_exercice}, '${compte}', '${type}', 
              '${controles[0]?.id_controle || 'IMMO_CHARGE'}', '${messageAnomalie.replace(/'/g, "''")} - Charge ${compte}: débit suppérieur à ${SEUIL_CAPITALISATION}', 
              ${savedData.valide || false}, '${(savedData.commentaire || '').replace(/'/g, "''")}', ${savedData.id_periode || idPeriode || 'NULL'}, NOW(), NOW()
            )
            ON CONFLICT (id_compte, id_dossier, id_exercice, id_jnl, id_controle) DO NOTHING
          `;
          await db.sequelize.query(insertQuery, { type: db.Sequelize.QueryTypes.INSERT });
        }
        
        // Mettre à jour les contrôles avec les anomalies
        for (const controle of controles) {
          const anomaliesControle = anomaliesDetectees.filter(a => a.controleId === controle.id);
          const detailsJson = anomaliesControle.length > 0 
            ? JSON.stringify(anomaliesControle.map(a => ({
                compte: a.compte,
                montant: a.montant,
                type: a.type,
                message: a.message
              }))).replace(/'/g, "''")
            : JSON.stringify([{ message: 'Pas d\'anomalie détectée' }]).replace(/'/g, "''");
          
          const updateQuery = `
            UPDATE table_revisions_controles
            SET anomalies = ${anomaliesControle.length},
                details = '${detailsJson}'
            WHERE id = ${controle.id}
          `;
          await db.sequelize.query(updateQuery, { type: db.Sequelize.QueryTypes.UPDATE });
        }
      }

      // ===== CONTRÔLE UTIL_CPT_TVA =====
      else if (type === 'UTIL_CPT_TVA') {
        console.log('DEBUG UTIL_CPT_TVA - Démarrage du contrôle');
        
        // 1. Récupérer les comptes TVA immobilisation depuis ParamTVA (nature = IMMO)
        const paramTvaQuery = `
          SELECT dpc.compte as compte_tva
          FROM paramtvas pt
          JOIN listecodetvas lct ON pt.type = lct.id
          JOIN dossierplancomptables dpc ON pt.id_cptcompta = dpc.id
          WHERE pt.id_compte = ${id_compte}
            AND pt.id_dossier = ${id_dossier}
            AND lct.nature = 'IMMO'
        `;
        console.log('DEBUG UTIL_CPT_TVA - paramTvaQuery:', paramTvaQuery);
        const paramTvaImmo = await db.sequelize.query(paramTvaQuery, { type: db.Sequelize.QueryTypes.SELECT });
        console.log('DEBUG UTIL_CPT_TVA - Comptes TVA immo trouvés:', paramTvaImmo.length);
        
        // Créer un Set des comptes TVA immobilisation pour recherche rapide
        const comptesTvaImmo = new Set(paramTvaImmo.map(p => p.compte_tva).filter(Boolean));
        console.log('DEBUG UTIL_CPT_TVA - Set des comptes TVA immo:', [...comptesTvaImmo]);
        
        // Construire la condition pour récupérer les écritures (classe 2 OU comptes TVA immo)
        let tvaConditions = [];
        if (comptesTvaImmo.size > 0) {
          tvaConditions = [...comptesTvaImmo].map(c => `comptegen LIKE '${c}%' OR compteaux LIKE '${c}%'`);
        }
        const classe2Condition = "comptegen LIKE '2%' OR compteaux LIKE '2%'";
        const allConditions = tvaConditions.length > 0 
          ? `(${classe2Condition} OR ${tvaConditions.join(' OR ')})`
          : `(${classe2Condition})`;
        
        // 2. Récupérer les IDs des journaux de type RAN
        const ranJournalsQuery = `
          SELECT id FROM codejournals 
          WHERE id_compte = ${id_compte} 
            AND id_dossier = ${id_dossier} 
            AND type = 'RAN'
        `;
        const ranJournals = await db.sequelize.query(ranJournalsQuery, { type: db.Sequelize.QueryTypes.SELECT });
        const ranJournalIds = ranJournals.map(j => j.id).filter(Boolean);
        console.log('DEBUG UTIL_CPT_TVA - Journaux RAN à exclure:', ranJournalIds);
        
        // Construire la condition d'exclusion RAN
        const ranExcludeCondition = ranJournalIds.length > 0 
          ? `AND id_journal NOT IN (${ranJournalIds.join(',')})`
          : '';
        
        // 3. Récupérer les écritures concernées (exclure les journaux RAN)
        const ecrituresQuery = `
          SELECT * FROM journals
          WHERE id_compte = ${id_compte}
            AND id_dossier = ${id_dossier}
            AND id_exercice = ${id_exercice}
            AND ${allConditions}
            ${ranExcludeCondition}
            ${dateCondition}
        `;
        console.log('DEBUG UTIL_CPT_TVA - ecrituresQuery:', ecrituresQuery);
        const ecritures = await db.sequelize.query(ecrituresQuery, { type: db.Sequelize.QueryTypes.SELECT });
        console.log('DEBUG UTIL_CPT_TVA - Nombre total de lignes:', ecritures.length);
        
        // Grouper les lignes par id_ecriture
        const ecrituresById = {};
        for (const ligne of ecritures) {
          const idEcriture = ligne.id_ecriture;
          if (!idEcriture) continue;
          
          if (!ecrituresById[idEcriture]) {
            ecrituresById[idEcriture] = [];
          }
          ecrituresById[idEcriture].push(ligne);
        }
        
        console.log('DEBUG UTIL_CPT_TVA - Nombre d\'écritures uniques:', Object.keys(ecrituresById).length);
        
        // 3. Vérifier chaque écriture
        for (const [idEcriture, lignes] of Object.entries(ecrituresById)) {
          // Vérifier si l'écriture contient un compte de classe 2
          const hasClasse2 = lignes.some(l => {
            const compte = l.comptegen || l.compteaux || '';
            return compte.startsWith('2');
          });
          
          // Vérifier si l'écriture contient un compte TVA immobilisation (de ParamTVA)
          const hasTvaImmo = lignes.some(l => {
            const compte = l.comptegen || l.compteaux || '';
            // Vérifier si le compte commence par l'un des comptes TVA immo
            for (const tvaCompte of comptesTvaImmo) {
              if (compte.startsWith(tvaCompte)) return true;
            }
            return false;
          });
          
          // Détecter l'anomalie
          let anomalieType = null;
          let anomalieMessage = '';
          
          if (hasClasse2 && !hasTvaImmo) {
            anomalieType = 'CLASSE2_SANS_TVA_IMMO';
            anomalieMessage = `Écriture avec compte classe 2 mais sans compte TVA immobilisation`;
          } else if (!hasClasse2 && hasTvaImmo) {
            anomalieType = 'TVA_IMMO_SANS_CLASSE2';
            anomalieMessage = `Écriture avec compte TVA immobilisation mais sans compte classe 2`;
          }
          
          if (anomalieType) {
            // Récupérer les données sauvegardées si elles existent
            const key = `${idEcriture}_${controles[0]?.id_controle || 'UTIL_CPT_TVA'}`;
            const savedData = anomaliesMap[key] || {};
            const valide = savedData.valide || false;
            const commentaire = savedData.commentaire || '';
            const periodeId = savedData.id_periode || idPeriode || 'NULL';
            
            // Stocker l'anomalie
            anomaliesDetectees.push({
              controleId: controles[0]?.id,
              idEcriture: idEcriture,
              type: anomalieType,
              message: anomalieMessage,
              ecritureComplete: lignes,
              hasClasse2,
              hasTvaImmo
            });
            
            // Insérer dans table_controle_anomalies
            const insertQuery = `
              INSERT INTO table_controle_anomalies (
                id_compte, id_dossier, id_exercice, id_jnl, "codeCtrl", id_controle, message, 
                valide, commentaire, id_periode, "createdAt", "updatedAt"
              ) VALUES (
                ${id_compte}, ${id_dossier}, ${id_exercice}, '${idEcriture}', '${type}', 
                '${controles[0]?.id_controle || 'UTIL_CPT_TVA'}', '${anomalieMessage.replace(/'/g, "''")}', 
                ${valide}, '${(commentaire || '').replace(/'/g, "''")}', ${periodeId}, NOW(), NOW()
              )
              ON CONFLICT (id_compte, id_dossier, id_exercice, id_jnl, id_controle) DO NOTHING
            `;
            await db.sequelize.query(insertQuery, { type: db.Sequelize.QueryTypes.INSERT });
          }
        }
        
        // Mettre à jour les contrôles avec les anomalies
        for (const controle of controles) {
          const anomaliesControle = anomaliesDetectees.filter(a => a.controleId === controle.id);
          const detailsJson = anomaliesControle.length > 0 
            ? JSON.stringify(anomaliesControle.map(a => ({
                idEcriture: a.idEcriture,
                type: a.type,
                message: a.message
              }))).replace(/'/g, "''")
            : JSON.stringify([{ message: 'Pas d\'anomalie détectée' }]).replace(/'/g, "''");
          
          const updateQuery = `
            UPDATE table_revisions_controles
            SET anomalies = ${anomaliesControle.length},
                details = '${detailsJson}'
            WHERE id = ${controle.id}
          `;
          await db.sequelize.query(updateQuery, { type: db.Sequelize.QueryTypes.UPDATE });
        }
      }

      // ===== CONTRÔLE ATYPIQUE =====
      else if (type === 'ATYPIQUE') {
        console.log('\n========================================');
        console.log('🚀 CONTRÔLE ATYPIQUE DÉMARRÉ');
        console.log('========================================');
        console.log('Nombre de contrôles ATYPIQUE:', controles.length);
        console.log('IDs des contrôles:', controles.map(c => c.id_controle));
        
        const K = 3;
        console.log('DEBUG ATYPIQUE - Mode exercice courant (stats par compte, en une requête)');

        // Une seule requête: montant par ligne + stats (moyenne, écart-type) par compte (comptegen)
        // Puis filtre des lignes atypiques: montant > moyenne + K*écart_type
        const atypiqueQuery = `
          WITH base AS (
            SELECT
              j.id,
              j.id_ecriture,
              j.dateecriture,
              j.comptegen,
              j.compteaux,
              j.piece,
              j.libelle,
              COALESCE(j.debit, 0)::numeric AS debit,
              COALESCE(j.credit, 0)::numeric AS credit,
              (COALESCE(j.debit, 0)::numeric + COALESCE(j.credit, 0)::numeric) AS montant
            FROM journals j
            WHERE j.id_compte = ${id_compte}
              AND j.id_dossier = ${id_dossier}
              AND j.id_exercice = ${id_exercice}
              ${dateCondition}
              AND j.comptegen IS NOT NULL
          ), stats AS (
            SELECT
              comptegen,
              AVG(montant) AS moyenne,
              STDDEV_POP(montant) AS ecart_type
            FROM base
            GROUP BY comptegen
          )
          SELECT
            b.*,
            s.moyenne,
            s.ecart_type,
            (s.moyenne + (${K} * s.ecart_type)) AS seuil
          FROM base b
          JOIN stats s ON s.comptegen = b.comptegen
          WHERE s.ecart_type IS NOT NULL
            AND s.ecart_type > 0
            AND (b.montant - s.moyenne - (${K} * s.ecart_type)) > 0
          ORDER BY b.comptegen ASC, b.dateecriture ASC, b.id ASC
        `;

        const rows = await db.sequelize.query(atypiqueQuery, { type: db.Sequelize.QueryTypes.SELECT });
        console.log(`DEBUG ATYPIQUE - Lignes atypiques trouvées: ${rows.length}`);

        for (const row of rows) {
          const compte = row.comptegen;
          const montant = parseFloat(row.montant) || 0;
          const moyenne = parseFloat(row.moyenne) || 0;
          const ecartType = parseFloat(row.ecart_type) || 0;
          const seuil = parseFloat(row.seuil) || (moyenne + (K * ecartType));

          const messageAnomalie = `Compte ${compte}`;

          const key = `${row.id}_${controles[0]?.id_controle || 'ATYPIQUE'}`;
          const savedData = anomaliesMap[key] || {};

          anomaliesDetectees.push({
            controleId: controles[0]?.id,
            idEcriture: row.id_ecriture,
            idJournalLine: row.id,
            compte,
            montant,
            moyenne,
            ecartType,
            seuil,
            message: messageAnomalie
          });

          const insertQuery = `
            INSERT INTO table_controle_anomalies (
              id_compte, id_dossier, id_exercice, id_jnl, "codeCtrl", id_controle, message,
              valide, commentaire, id_periode, "createdAt", "updatedAt"
            ) VALUES (
              ${id_compte}, ${id_dossier}, ${id_exercice}, '${row.id}', '${type}',
              '${controles[0]?.id_controle || 'ATYPIQUE'}', '${messageAnomalie.replace(/'/g, "''")}',
              ${savedData.valide || false}, '${(savedData.commentaire || '').replace(/'/g, "''")}', ${savedData.id_periode || idPeriode || 'NULL'}, NOW(), NOW()
            )
            ON CONFLICT (id_compte, id_dossier, id_exercice, id_jnl, id_controle) DO NOTHING
          `;
          await db.sequelize.query(insertQuery, { type: db.Sequelize.QueryTypes.INSERT });
        }

        // Mettre à jour les contrôles
        for (const controle of controles) {
          const anomaliesControle = anomaliesDetectees.filter(a => a.controleId === controle.id);
          const detailsJson = anomaliesControle.length > 0
            ? JSON.stringify(anomaliesControle.map(a => ({
                idJournalLine: a.idJournalLine,
                idEcriture: a.idEcriture,
                compte: a.compte,
                montant: a.montant,
                moyenne: a.moyenne,
                ecartType: a.ecartType,
                seuil: a.seuil,
                message: a.message
              }))).replace(/'/g, "''")
            : JSON.stringify([{ message: 'Pas d\'anomalie atypique détectée' }]).replace(/'/g, "''");

          const updateQuery = `
            UPDATE table_revisions_controles
            SET anomalies = ${anomaliesControle.length},
                details = '${detailsJson}'
            WHERE id = ${controle.id}
          `;
          await db.sequelize.query(updateQuery, { type: db.Sequelize.QueryTypes.UPDATE });
        }

        console.log('DEBUG ATYPIQUE -', anomaliesDetectees.length, 'anomalies détectées');
      }

      resultsByType[type] = {
        controlesCount: controles.length,
        anomaliesCount: anomaliesDetectees.length,
        anomalies: anomaliesDetectees
      };

      console.log(`Type ${type}: ${anomaliesDetectees.length} anomalies detected`);
    }

    const totalEcritures = await db.tableControleAnomalies.count({
      where: {
        id_compte: id_compte,
        id_dossier: id_dossier,
        id_exercice: id_exercice
      }
    });

    res.json({
      state: true,
      message: 'Contrôle global exécuté avec succès',
      totalControles: newControles.length,
      totalTypes: Object.keys(controlesByType).length,
      totalEcritures,
      resultsByType
    });
  } catch (error) {
    console.error('Error in executeAll:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de l\'exécution du contrôle global',
      error: error.message
    });
  }
};
