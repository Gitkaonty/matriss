const db = require("../../Models");
const { journals, exercices } = db;
const { Op } = require("sequelize");
const recupExerciceN1 = require('../../Middlewares/Standard/recupExerciceN1');

const round2 = (value) => Math.round(value * 100) / 100;

exports.getRevuAnalytiqueNN1 = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice } = req.params;
        let { date_debut, date_fin } = req.query; // Dates de periode si selectionnee
        const { id_periode } = req.query; // ID de periode alternative

        // Si id_periode est fourni mais pas les dates, récupérer les dates de la période
        if (id_periode && (!date_debut || !date_fin)) {
            console.log('[DEBUG NN1] Récupération des dates pour id_periode:', id_periode);
            const periode = await db.Periode.findOne({
                where: { id: id_periode }
            });
            if (periode) {
                date_debut = periode.date_debut;
                date_fin = periode.date_fin;
                console.log('[DEBUG NN1] Dates récupérées:', { date_debut, date_fin });
            } else {
                console.log('[DEBUG NN1] Période non trouvée pour id:', id_periode);
            }
        }

        if (!id_compte || !id_dossier || !id_exercice) {
            return res.status(400).json({ state: false, message: 'Paramètres manquants' });
        }

        // console.log('[revuAnalytiqueNN1] params', { id_compte, id_dossier, id_exercice, date_debut, date_fin });

        // Récupérer l'exercice N
        const exerciceN = await exercices.findOne({
            where: { id: id_exercice }
        });
        if (!exerciceN) {
            return res.status(404).json({ state: false, message: "Exercice N non trouvé" });
        }

        // Récupérer l'exercice N-1
        const exerciceN1 = await exercices.findOne({
            where: {
                id_dossier,
                rang: exerciceN.rang - 1 // on utilise rang ici
            }
        });

        const id_exerciceN1 = exerciceN1 ? exerciceN1.id : null;
        // console.log('[revuAnalytiqueNN1] hasN1 =', !!exerciceN1, 'id_exerciceN1 =', id_exerciceN1);

        // Calcul du facteur de proratisation pour N-1
        let facteurProrata = 1; // Par défaut, pas de proratisation
        let nbrMoisPeriodeN = null;
        let nbrMoisTotalN1 = null;
        
        if (exerciceN1 && exerciceN1.date_debut && exerciceN1.date_fin) {
            // Nombre de mois total de l'exercice N-1
            const debutN1 = new Date(exerciceN1.date_debut);
            const finN1 = new Date(exerciceN1.date_fin);
            nbrMoisTotalN1 = (finN1.getFullYear() - debutN1.getFullYear()) * 12 + 
                             (finN1.getMonth() - debutN1.getMonth()) + 1;
            
            // Si une période est sélectionnée dans N, calculer sa durée en mois
            if (date_debut && date_fin) {
                const debutPeriode = new Date(date_debut);
                const finPeriode = new Date(date_fin);
                nbrMoisPeriodeN = (finPeriode.getFullYear() - debutPeriode.getFullYear()) * 12 + 
                                  (finPeriode.getMonth() - debutPeriode.getMonth()) + 1;
                
                // Calculer le facteur de proratisation
                if (nbrMoisTotalN1 > 0) {
                    facteurProrata = nbrMoisPeriodeN / nbrMoisTotalN1;
                }
            }
        }
        
        // console.log('[revuAnalytiqueNN1] prorata:', { nbrMoisPeriodeN, nbrMoisTotalN1, facteurProrata });

        // Requête SQL pour agréger les données des exercices N et N-1
        // Dans la requête SQL, on peut calculer directement var et var%
        let query;
        let replacements;

        // Condition de date pour N (filtre par periode si applicable)
        const dateConditionN = date_debut && date_fin 
            ? `AND id_exercice = (SELECT id FROM exerciceN) AND dateecriture BETWEEN :date_debut AND :date_fin`
            : `AND id_exercice = (SELECT id FROM exerciceN)`;
        
        // Pour N-1, on prend tout l exercice complet (pas de filtre par date) car on applique le prorata
        const dateConditionN1 = `AND id_exercice = (SELECT id FROM exerciceN1)`;

        if (exerciceN1) {
            // Si N-1 existe, on fait la jointure complète
            query = `
               WITH exos AS (
                    SELECT id, id_dossier, rang
                    FROM exercices
                    WHERE id_dossier = :id_dossier
                ),
                exerciceN AS (
                    SELECT id
                    FROM exos
                    WHERE id = :id_exercice
                    LIMIT 1
                ),
                exerciceN1 AS (
                    SELECT id
                    FROM exos
                    WHERE rang < (SELECT rang FROM exos WHERE id = :id_exercice)
                    ORDER BY rang DESC
                    LIMIT 1
                )
                SELECT
                    COALESCE(jn.compte_key, jn1.compte_key) AS compte,
                    COALESCE(jn.libellecompte, jn1.libellecompte) AS libelle,
                    COALESCE(jn.solde, 0) AS "soldeN",
                    jn1.solde * :facteurProrata AS "soldeN1",
                    COALESCE(jn.solde, 0) - COALESCE(jn1.solde * :facteurProrata, 0) AS var,
                    CASE
                        WHEN ABS(COALESCE(jn.solde, 0)) < 0.01 AND ABS(COALESCE(jn1.solde * :facteurProrata, 0)) < 0.01 THEN 0
                        WHEN jn1.compte_key IS NULL AND ABS(COALESCE(jn.solde, 0)) < 0.01 THEN 0
                        WHEN jn1.compte_key IS NULL THEN 100
                        WHEN ABS(COALESCE(jn1.solde * :facteurProrata, 0)) < 0.01 AND ABS(COALESCE(jn.solde, 0)) >= 0.01 THEN 100
                        ELSE ROUND(
                            (
                                ((COALESCE(jn.solde, 0) - COALESCE(jn1.solde * :facteurProrata, 0)) / NULLIF(jn1.solde * :facteurProrata, 0)) * 100
                            )::numeric
                        , 2)
                    END AS "varPourcent",
                    COALESCE(ca.valide_anomalie, false) AS "valide_anomalie",
                    CASE
                        WHEN jn1.compte_key IS NULL THEN false
                        WHEN COALESCE(jn1.solde * :facteurProrata, 0) != 0
                        AND ABS((COALESCE(jn.solde, 0) - COALESCE(jn1.solde * :facteurProrata, 0)) / (jn1.solde * :facteurProrata)) >= 0.3
                            THEN true
                        ELSE false
                    END AS anomalies,
                    COALESCE(ca.commentaire, '') AS commentaire
                FROM (
                    SELECT
                        NULLIF(TRIM(comptegen), '') AS compte_key,
                        libellecompte,
                        SUM(COALESCE(debit, 0) - COALESCE(credit, 0)) AS solde
                    FROM journals
                    WHERE id_compte = :id_compte
                    AND id_dossier = :id_dossier
                    ${dateConditionN}
                    AND comptegen IS NOT NULL
                    AND TRIM(comptegen) != ''
                    GROUP BY NULLIF(TRIM(comptegen), ''), libellecompte
                ) jn
                FULL OUTER JOIN (
                    SELECT
                        NULLIF(TRIM(comptegen), '') AS compte_key,
                        libellecompte,
                        SUM(COALESCE(debit, 0) - COALESCE(credit, 0)) AS solde
                    FROM journals
                    WHERE id_compte = :id_compte
                    AND id_dossier = :id_dossier
                    ${dateConditionN1}
                    AND comptegen IS NOT NULL
                    AND TRIM(comptegen) != ''
                    GROUP BY NULLIF(TRIM(comptegen), ''), libellecompte
                ) jn1 ON jn.compte_key = jn1.compte_key
                LEFT JOIN commentaireanalytiques ca
                    ON ca.id_compte = :id_compte
                    AND ca.id_dossier = :id_dossier
                    AND ca.id_exercice = :id_exercice
                    AND ca.compte = COALESCE(jn.compte_key, jn1.compte_key)
                ORDER BY compte;
            `;
            replacements = {
                id_compte,
                id_dossier,
                id_exercice,
                facteurProrata,
                ...(date_debut && { date_debut }),
                ...(date_fin && { date_fin })
            };
        } else {
            // Si N-1 n'existe pas, on ne sélectionne que les données N avec soldeN1 = 0
            const dateConditionSimple = date_debut && date_fin
                ? `AND j.id_exercice = :id_exercice AND j.dateecriture BETWEEN :date_debut AND :date_fin`
                : `AND j.id_exercice = :id_exercice`;
            
            query = `
                SELECT
                    NULLIF(TRIM(j.comptegen), '') AS compte,
                    j.libellecompte AS libelle,
                    SUM(COALESCE(j.debit, 0) - COALESCE(j.credit, 0)) AS "soldeN",
                    0 AS "soldeN1",
                    SUM(COALESCE(j.debit, 0) - COALESCE(j.credit, 0)) AS var,
                    100 AS "varPourcent",
                    COALESCE(ca.valide_anomalie, false) AS "valide_anomalie",
                    false AS anomalies,
                    COALESCE(ca.commentaire, '') AS commentaire
                FROM journals j
                LEFT JOIN commentaireanalytiques ca
                    ON ca.id_compte = :id_compte
                    AND ca.id_dossier = :id_dossier
                    AND ca.id_exercice = :id_exercice
                    AND ca.compte = NULLIF(TRIM(j.comptegen), '')
                WHERE j.id_compte = :id_compte
                AND j.id_dossier = :id_dossier
                ${dateConditionSimple}
                AND j.comptegen IS NOT NULL
                AND TRIM(j.comptegen) != ''
                GROUP BY NULLIF(TRIM(j.comptegen), ''), j.libellecompte, ca.valide_anomalie, ca.commentaire
                ORDER BY compte;
            `;
            replacements = {
                id_compte,
                id_dossier,
                id_exercice,
                ...(date_debut && { date_debut }),
                ...(date_fin && { date_fin })
            };
        }

        // Exécuter la requête
        // console.log('[revuAnalytiqueNN1] params reçus:', { id_compte, id_dossier, id_exercice, id_exerciceN1 });
        const results = await db.sequelize.query(query, {
            replacements: replacements,
            type: db.Sequelize.QueryTypes.SELECT
        });

        // Charger les validations depuis revu_analytique (agrégation pour gérer les doublons)
        console.log('[DEBUG NN1] Chargement validations depuis revu_analytique...');
        const revuDataRaw = await db.sequelize.query(
            `SELECT compte, SUM(anomalies_valides) as total_valides
             FROM revu_analytique
             WHERE id_compte = :id_compte
               AND id_dossier = :id_dossier
               AND id_exercice = :id_exercice
               AND type_revue = 'analytiqueNN1'
             GROUP BY compte`,
            {
                replacements: { id_compte, id_dossier, id_exercice },
                type: db.Sequelize.QueryTypes.SELECT,
                raw: true
            }
        );
        console.log('[DEBUG NN1] Validations trouvées (agrégées):', revuDataRaw.length);
        
        // Créer un map des validations par compte (somme des validations)
        const validationsMap = new Map();
        revuDataRaw.forEach((item) => {
            const compteKey = item.compte ? String(item.compte).trim() : '';
            const isValid = parseInt(item.total_valides) > 0;
            validationsMap.set(compteKey, isValid);
            console.log(`[DEBUG NN1] Validation compte "${compteKey}": ${isValid} (total_valides=${item.total_valides})`);
        });
        console.log('[DEBUG NN1] Keys dans validationsMap:', Array.from(validationsMap.keys()).slice(0, 10));

        // Totaux pour N
        const totals = await db.sequelize.query(
            `SELECT COUNT(*) as lignes, SUM(debit) as total_debit, SUM(credit) as total_credit
             FROM journals
             WHERE id_compte = :id_compte AND id_dossier = :id_dossier AND id_exercice = :id_exercice`,
            {
                replacements: { id_compte, id_dossier, id_exercice },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        // console.log('[revuAnalytiqueNN1] totals N', totals?.[0]);

        // Comptes distincts pour N
        const comptesDistincts = await db.sequelize.query(
            `SELECT DISTINCT TRIM(comptegen) as compte
             FROM journals
             WHERE id_compte = :id_compte AND id_dossier = :id_dossier AND id_exercice = :id_exercice
               AND comptegen IS NOT NULL AND TRIM(comptegen) != ''
             ORDER BY compte`,
            {
                replacements: { id_compte, id_dossier, id_exercice },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        // console.log('[revuAnalytiqueNN1] comptes distincts (N) count', comptesDistincts?.length || 0);
        // console.log('[revuAnalytiqueNN1] comptes distincts (N) sample', comptesDistincts?.slice(0, 20));

        if (id_exerciceN1) {
            const comptesDistinctsN1 = await db.sequelize.query(
                `SELECT DISTINCT TRIM(comptegen) as compte
                 FROM journals
                 WHERE id_compte = :id_compte AND id_dossier = :id_dossier AND id_exercice = :id_exerciceN1
                   AND comptegen IS NOT NULL AND TRIM(comptegen) != ''
                 ORDER BY compte`,
                {
                    replacements: { id_compte, id_dossier, id_exerciceN1 },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // console.log('[revuAnalytiqueNN1] comptes distincts (N-1) count', comptesDistinctsN1?.length || 0);
            // console.log('[revuAnalytiqueNN1] comptes distincts (N-1) sample', comptesDistinctsN1?.slice(0, 20));

            const setN = new Set((comptesDistincts || []).map(r => r.compte));
            const setN1 = new Set((comptesDistinctsN1 || []).map(r => r.compte));
            const onlyInN = Array.from(setN).filter(c => !setN1.has(c));
            const onlyInN1 = Array.from(setN1).filter(c => !setN.has(c));

            // console.log('[revuAnalytiqueNN1] comptes seulement dans N count', onlyInN.length);
            // console.log('[revuAnalytiqueNN1] comptes seulement dans N sample', onlyInN.slice(0, 30));
            // console.log('[revuAnalytiqueNN1] comptes seulement dans N-1 count', onlyInN1.length);
            // console.log('[revuAnalytiqueNN1] comptes seulement dans N-1 sample', onlyInN1.slice(0, 30));
        }

        // console.log('[revuAnalytiqueNN1] raw results count', results?.length || 0);
        // console.log('[revuAnalytiqueNN1] raw results sample', results?.slice(0, 10));
        console.log('[DEBUG NN1] Nombre de results:', results.length);
        console.log('[DEBUG NN1] Sample results comptes:', results.slice(0, 5).map(r => r.compte));

        // Formatter les résultats
        let validCount = 0;
        const formattedResults = results.map((row, index) => {
            // Nettoyer le compte : enlever les guillemets et trim
            let compteKey = row.compte ? String(row.compte).trim() : '';
            compteKey = compteKey.replace(/^"+|"+$/g, ''); // enlever guillemets au début/fin
            const isValid = validationsMap.get(compteKey) || false;
            if (isValid) validCount++;
            // Log pour les premières lignes ou si c'est un compte qui devrait être validé
            if (index < 10 || ['10130000', '10611000', '10680000', '11000000'].includes(compteKey)) {
                console.log(`[DEBUG NN1] Row ${index}: compte="${compteKey}", isValid=${isValid}, inMap=${validationsMap.has(compteKey)}`);
            }
            return {
                compte: compteKey,
                libelle: row.libelle || '',
                soldeN: round2(parseFloat(row.soldeN) || 0),
                soldeN1: row.soldeN1 !== null && row.soldeN1 !== undefined ? round2(parseFloat(row.soldeN1)) : null,
                var: round2(parseFloat(row.var) || 0),
                varPourcent: row.varPourcent !== null && row.varPourcent !== undefined ? round2(parseFloat(row.varPourcent)) : null,
                valide_anomalie: isValid,
                anomalies: !!row.anomalies,
                commentaire: row.commentaire || ''
            };
        });
        console.log('[DEBUG NN1] Formatted results avec validations:', validCount, 'validés');
        if (validCount > 0) {
            console.log('[DEBUG NN1] Exemples de comptes validés:', formattedResults.filter(r => r.valide_anomalie).slice(0, 5).map(r => r.compte));
        }
        // console.log('[revuAnalytiqueNN1] formatted results sample', formattedResults.slice(0, 10));

        // Sauvegarder/Mettre à jour les anomalies dans revu_analytique pour la synthèse
        try {
            console.log('[DEBUG NN1] Sauvegarde des anomalies dans revu_analytique...');
            const anomaliesToSave = formattedResults.filter(r => r.anomalies);
            console.log('[DEBUG NN1] Nombre d\'anomalies à sauvegarder:', anomaliesToSave.length);

            for (const anomaly of anomaliesToSave) {
                // Vérifier si une entrée existe déjà
                const [existing] = await db.RevuAnalytique.findOrCreate({
                    where: {
                        id_compte,
                        id_exercice,
                        id_dossier,
                        id_periode: null, // N/N1 n'a pas de période
                        compte: anomaly.compte,
                        type_revue: 'analytiqueNN1'
                    },
                    defaults: {
                        nbr_anomalies: 1,
                        anomalies_valides: anomaly.valide_anomalie ? 1 : 0
                    }
                });

                if (!existing.isNewRecord) {
                    // Mettre à jour si nécessaire
                    await existing.update({
                        nbr_anomalies: 1,
                        // Préserver les validations existantes
                        anomalies_valides: anomaly.valide_anomalie ? 1 : (existing.anomalies_valides || 0)
                    });
                }
            }

            console.log('[DEBUG NN1] Sauvegarde terminée:', anomaliesToSave.length, 'entrées');
        } catch (saveError) {
            console.error('[DEBUG NN1] Erreur lors de la sauvegarde:', saveError.message);
            // Ne pas bloquer la réponse si la sauvegarde échoue
        }

        return res.json({
            data: formattedResults,
            state: true,
            message: 'Données récupérées avec succès'
        });
    } catch (error) {
        console.error('Erreur dans getRevuAnalytiqueNN1:', error);
        return res.status(500).json({
            message: "Erreur serveur",
            state: false,
            error: error.message
        });
    }
};