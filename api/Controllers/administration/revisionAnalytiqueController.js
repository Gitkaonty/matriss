const db = require('../../Models');
const { QueryTypes } = require('sequelize');

/**
 * POST /administration/revisionAnalytique/:id_compte/:id_dossier/:id_exercice
 * Vérifie que chaque ligne des comptes 6* et 7* possèdent des analytiques
 * Algorithme : sélectionner toutes les lignes (6* et 7*) dont le total des analytiques = 0
 */
exports.controlerAnalytiques = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice } = req.params;
        const { date_debut, date_fin, id_periode } = req.query;

        if (!id_compte || !id_dossier || !id_exercice) {
            return res.status(400).json({
                state: false,
                message: 'Paramètres manquants: id_compte, id_dossier, id_exercice requis'
            });
        }

        // Validation des dates
        if (!date_debut || !date_fin) {
            return res.status(400).json({
                state: false,
                message: 'Les dates de début et fin sont requises'
            });
        }

        // Étape 1: Nettoyer les anciens résultats pour cette combinaison
        await db.revisionAnalytiqueResultats.destroy({
            where: {
                id_compte,
                id_dossier,
                id_exercice,
                id_periode: id_periode || null
            }
        });

        // Étape 2: Requête SQL pour trouver les lignes sans analytiques
        // Comptes commençant par 6 ou 7 dont le total des analytiques = 0
        const query = `
            SELECT
                j.id as id_jnl,
                j.dateecriture as date,
                j.comptegen as compte,
                j.libelle,
                COALESCE(j.debit, 0) as debit,
                COALESCE(j.credit, 0) as credit,
                COALESCE(SUM(a.debit - a.credit), 0) as total_analytiques
            FROM journals j
            LEFT JOIN analytiques a ON j.id = a.id_ligne_ecriture
                AND a.id_compte = :id_compte
                AND a.id_dossier = :id_dossier
                AND a.id_exercice = :id_exercice
            WHERE j.id_compte = :id_compte
                AND j.id_dossier = :id_dossier
                AND j.id_exercice = :id_exercice
                AND j.dateecriture BETWEEN :date_debut AND :date_fin
                AND (j.comptegen LIKE '6%' OR j.comptegen LIKE '7%')
            GROUP BY j.id, j.dateecriture, j.comptegen, j.libelle, j.debit, j.credit
            HAVING ABS(COALESCE(SUM(a.debit - a.credit), 0)) = 0
            ORDER BY j.dateecriture, j.comptegen
        `;

        const results = await db.sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: {
                id_compte,
                id_dossier,
                id_exercice,
                date_debut,
                date_fin
            }
        });

        // Étape 3: Insérer les résultats dans la table
        const resultsToInsert = results.map(row => ({
            id_compte: parseInt(id_compte),
            id_dossier: parseInt(id_dossier),
            id_exercice: parseInt(id_exercice),
            id_periode: id_periode ? parseInt(id_periode) : null,
            id_jnl: row.id_jnl,
            date: row.date,
            compte: row.compte,
            libelle: row.libelle || '',
            debit: row.debit || 0,
            credit: row.credit || 0,
            total_analytiques: row.total_analytiques || 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        if (resultsToInsert.length > 0) {
            await db.revisionAnalytiqueResultats.bulkCreate(resultsToInsert);
        }

        // Étape 4: Retourner les résultats formatés
        const formattedResults = resultsToInsert.map((item, index) => ({
            id: index + 1,
            id_jnl: item.id_jnl,
            date: item.date,
            compte: item.compte,
            libelle: item.libelle,
            debit: item.debit,
            credit: item.credit,
            total_analytiques: item.total_analytiques
        }));

        return res.status(200).json({
            state: true,
            message: `Contrôle terminé. ${formattedResults.length} ligne(s) sans analytiques trouvée(s) sur les comptes 6* et 7*.`,
            data: formattedResults,
            nbLignes: formattedResults.length
        });

    } catch (error) {
        console.error('Erreur contrôle analytique:', error);
        return res.status(500).json({
            state: false,
            message: 'Erreur lors du contrôle analytique',
            error: error.message
        });
    }
};

/**
 * GET /administration/revisionAnalytique/:id_compte/:id_dossier/:id_exercice
 * Récupère les résultats d'un contrôle précédent
 */
exports.getResultats = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice } = req.params;
        const { id_periode } = req.query;

        const whereClause = {
            id_compte,
            id_dossier,
            id_exercice
        };
        if (id_periode) whereClause.id_periode = id_periode;

        const resultats = await db.revisionAnalytiqueResultats.findAll({
            where: whereClause,
            order: [['date', 'ASC'], ['compte', 'ASC']]
        });

        const formattedResults = resultats.map((item, index) => ({
            id: index + 1,
            id_db: item.id,
            id_jnl: item.id_jnl,
            date: item.date,
            compte: item.compte,
            libelle: item.libelle,
            debit: item.debit,
            credit: item.credit,
            total_analytiques: item.total_analytiques
        }));

        return res.status(200).json({
            state: true,
            data: formattedResults,
            nbLignes: formattedResults.length
        });

    } catch (error) {
        console.error('Erreur récupération résultats:', error);
        return res.status(500).json({
            state: false,
            message: 'Erreur lors de la récupération des résultats',
            error: error.message
        });
    }
};

/**
 * DELETE /administration/revisionAnalytique/:id_compte/:id_dossier/:id_exercice
 * Supprime les résultats d'un contrôle
 */
exports.supprimerResultats = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice } = req.params;
        const { id_periode } = req.query;

        const whereClause = {
            id_compte,
            id_dossier,
            id_exercice
        };
        if (id_periode) whereClause.id_periode = id_periode;

        await db.revisionAnalytiqueResultats.destroy({ where: whereClause });

        return res.status(200).json({
            state: true,
            message: 'Résultats supprimés avec succès'
        });

    } catch (error) {
        console.error('Erreur suppression résultats:', error);
        return res.status(500).json({
            state: false,
            message: 'Erreur lors de la suppression des résultats',
            error: error.message
        });
    }
};
