const db = require('../../Models');

// Ajouter ou modifier un commentaire (mensuel)
const addOrUpdateCommentaireMensuelle = async (req, res) => {
    try {
        const commentaireAnalytiqueMensuelle = db.commentaireAnalytiqueMensuelle;
        if (!commentaireAnalytiqueMensuelle) {
            return res.status(500).json({
                state: false,
                message: "Modèle commentaireAnalytiqueMensuelle non initialisé",
            });
        }

        const { id_compte, id_exercice, id_dossier, compte, commentaire, valide_anomalie } = req.body;

        if (!id_compte || !id_exercice || !id_dossier || !compte) {
            return res.status(400).json({
                state: false,
                message: "Champs obligatoires manquants"
            });
        }

        const existingComment = await commentaireAnalytiqueMensuelle.findOne({
            where: {
                id_compte,
                id_exercice,
                id_dossier,
                compte
            }
        });

        let result;
        if (existingComment) {
            result = await existingComment.update({
                commentaire: commentaire || '',
                valide_anomalie: valide_anomalie !== undefined ? valide_anomalie : false
            });
        } else {
            result = await commentaireAnalytiqueMensuelle.create({
                id_compte,
                id_exercice,
                id_dossier,
                compte,
                commentaire: commentaire || '',
                valide_anomalie: valide_anomalie !== undefined ? valide_anomalie : false
            });
        }

        return res.json({
            state: true,
            message: existingComment ? "Commentaire mensuel mis à jour" : "Commentaire mensuel ajouté",
            data: result
        });

    } catch (error) {
        console.error('Erreur dans addOrUpdateCommentaireMensuelle:', error);
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

// Récupérer un commentaire (mensuel) pour un compte
const getCommentaireMensuelleByCompte = async (req, res) => {
    try {
        const commentaireAnalytiqueMensuelle = db.commentaireAnalytiqueMensuelle;
        if (!commentaireAnalytiqueMensuelle) {
            return res.status(500).json({
                state: false,
                message: "Modèle commentaireAnalytiqueMensuelle non initialisé",
            });
        }

        const { id_compte, id_exercice, id_dossier, compte } = req.params;

        const commentaire = await commentaireAnalytiqueMensuelle.findOne({
            where: {
                id_compte,
                id_exercice,
                id_dossier,
                compte
            }
        });

        return res.json({
            state: true,
            data: commentaire
        });

    } catch (error) {
        console.error('Erreur dans getCommentaireMensuelleByCompte:', error);
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

module.exports = {
    addOrUpdateCommentaireMensuelle,
    getCommentaireMensuelleByCompte
};
