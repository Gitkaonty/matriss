const db = require("../../Models");
const { journals, exercices } = db;
const { Op } = require("sequelize");
const recupExerciceN1 = require('../../Middlewares/Standard/recupExerciceN1');

const round2 = (value) => Math.round(value * 100) / 100;

exports.getRevuAnalytiqueNN1 = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice } = req.params;
        const { date_debut, date_fin } = req.query; // Dates de periode si selectionnee

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

 
            query = `
                WITH exos AS (
                    SELECT id, id_dossier, rang
                    FROM exercices
                    WHERE id_dossier = :id_dossier
                ),

                exerciceN AS (
                    SELECT id, rang
                    FROM exos
                    WHERE id = :id_exercice
                ),

                exerciceN1 AS (
                    SELECT id
                    FROM exos
                    WHERE rang = (SELECT rang - 1 FROM exerciceN)
                ),

                jn AS (
                    SELECT
                        NULLIF(TRIM(comptegen),'') AS compte_key,
                        MIN(libellecompte) AS libellecompte,
                        SUM(COALESCE(debit,0) - COALESCE(credit,0)) AS solde
                    FROM journals
                    WHERE id_compte = :id_compte
                    AND id_dossier = :id_dossier
                    AND id_exercice = (SELECT id FROM exerciceN)
                    ${date_debut && date_fin ? 'AND dateecriture BETWEEN :date_debut AND :date_fin' : ''}
                    AND comptegen IS NOT NULL
                    AND TRIM(comptegen) != ''
                    GROUP BY NULLIF(TRIM(comptegen),'')
                ),

                jn1 AS (
                    SELECT
                        NULLIF(TRIM(comptegen),'') AS compte_key,
                        MIN(libellecompte) AS libellecompte,
                        SUM(COALESCE(debit,0) - COALESCE(credit,0)) AS solde
                    FROM journals
                    WHERE id_compte = :id_compte
                    AND id_dossier = :id_dossier
                    AND id_exercice = (SELECT id FROM exerciceN1)
                    AND comptegen IS NOT NULL
                    AND TRIM(comptegen) != ''
                    GROUP BY NULLIF(TRIM(comptegen),'')
                )

                SELECT
                    COALESCE(jn.compte_key, jn1.compte_key) AS compte,
                    COALESCE(jn.libellecompte, jn1.libellecompte) AS libelle,
                    COALESCE(jn.solde,0) AS "soldeN",
                    COALESCE(jn1.solde * :facteurProrata,0) AS "soldeN1",
                    COALESCE(jn.solde,0) - COALESCE(jn1.solde * :facteurProrata,0) AS var,

                    CASE
                        WHEN COALESCE(jn1.solde * :facteurProrata,0) = 0 AND COALESCE(jn.solde,0) = 0 THEN 0
                        WHEN COALESCE(jn1.solde * :facteurProrata,0) = 0 AND COALESCE(jn.solde,0) != 0 THEN 100
                        ELSE ROUND(
                            (((COALESCE(jn.solde,0) - COALESCE(jn1.solde * :facteurProrata,0))
                            / NULLIF(jn1.solde * :facteurProrata,0)) * 100)::numeric
                        ,2)
                    END AS "varPourcent",

                    COALESCE(ca.valide_anomalie,false) AS "valide_anomalie",

                    CASE
                        WHEN COALESCE(jn1.solde * :facteurProrata,0) = 0 THEN false
                        WHEN ABS((COALESCE(jn.solde,0) - COALESCE(jn1.solde * :facteurProrata,0))
                                / NULLIF(jn1.solde * :facteurProrata,0)) >= 0.3 THEN true
                        ELSE false
                    END AS anomalies,

                    COALESCE(ca.commentaire,'') AS commentaire

                FROM jn
                FULL OUTER JOIN jn1 ON jn.compte_key = jn1.compte_key

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
        

        // Exécuter la requête
        // console.log('[revuAnalytiqueNN1] params reçus:', { id_compte, id_dossier, id_exercice, id_exerciceN1 });
        const results = await db.sequelize.query(query, {
            replacements: replacements,
            type: db.Sequelize.QueryTypes.SELECT
        });

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

            const setN = new Set((comptesDistincts || []).map(r => r.compte));
            const setN1 = new Set((comptesDistinctsN1 || []).map(r => r.compte));
            const onlyInN = Array.from(setN).filter(c => !setN1.has(c));
            const onlyInN1 = Array.from(setN1).filter(c => !setN.has(c));
        }

        console.log('[revuAnalytiqueNN1] ===== DÉBOGAGE VAR POURCENT =====');
        console.log('[revuAnalytiqueNN1] Nombre de résultats:', results?.length);
        console.log('[revuAnalytiqueNN1] Échantillon brut (3 premiers):', results?.slice(0, 3));
        console.log('[revuAnalytiqueNN1] Facteur prorata:', facteurProrata);
        console.log('[revuAnalytiqueNN1] Exercice N-1 existe:', !!exerciceN1);
        console.log('[revuAnalytiqueNN1] ==================================');

        const formattedResults = results.map(row => {
            const soldeN = parseFloat(row.soldeN) || 0;
            const soldeN1 = row.soldeN1 !== null ? parseFloat(row.soldeN1) : 0;
            const varPourcentBrut = row.varPourcent;
            
            if (soldeN !== 0 && (varPourcentBrut === 0 || varPourcentBrut === null || varPourcentBrut === undefined)) {
                console.log('[revuAnalytiqueNN1] ⚠️ varPourcent à 0 alors que soldeN non nul:', {
                    compte: row.compte,
                    soldeN: soldeN,
                    soldeN1: soldeN1,
                    varPourcentBrut: varPourcentBrut,
                    varPourcentType: typeof varPourcentBrut
                });
            }
            
            return {
                compte: row.compte || '',
                libelle: row.libelle || '',
                soldeN: round2(soldeN),
                soldeN1: row.soldeN1 !== null && row.soldeN1 !== undefined ? round2(soldeN1) : null,
                var: round2(parseFloat(row.var) || 0),
                varPourcent: varPourcentBrut !== null && varPourcentBrut !== undefined ? round2(parseFloat(varPourcentBrut)) : null,
                valide_anomalie: !!row.valide_anomalie,
                anomalies: !!row.anomalies,
                commentaire: row.commentaire || ''
            };
        });
        
        console.log('[revuAnalytiqueNN1] ===== RÉSULTATS FORMATÉS =====');
        console.log('[revuAnalytiqueNN1] Échantillon formaté (3 premiers):', formattedResults.slice(0, 3));
        console.log('[revuAnalytiqueNN1] ===============================');

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