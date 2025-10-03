const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');

const caAxes = db.caAxes;
const caSections = db.caSections;
const dossier = db.dossiers;

// Fonction pour plurieliser un mot
function pluralize(count, word) {
    return count > 1 ? word + 's' : word;
}

exports.getAxes = async (req, res) => {
    try {
        const { id_dossier, id_compte } = req.params;
        const axes = await caAxes.findAll({
            where: {
                id_dossier,
                id_compte
            },
            order: [['id', 'ASC']]
        });
        return res.status(200).json({
            state: true,
            data: axes,
            message: `Données reçues`
        });
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.addAxe = async (req, res) => {
    try {
        const { code, libelle, id_dossier, id_compte } = req.body;
        const axesCreted = await caAxes.create({
            code,
            libelle,
            id_dossier,
            id_compte
        });
        return res.json(axesCreted)
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.addSection = async (req, res) => {
    try {
        const { intitule, compte, id_dossier, id_compte, id_axe, pourcentage, section, par_defaut, fermer } = req.body;
        const axesCreted = await caSections.create({
            intitule,
            compte,
            id_dossier,
            id_compte,
            id_axe,
            pourcentage,
            section
        });
        return res.json(axesCreted)
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.getSectionsByAxeIds = async (req, res) => {
    try {
        const { id_compte, id_dossier } = req.params;
        const { selectedRowAxeIds } = req.body;

        if (!id_compte || !id_dossier || !selectedRowAxeIds || !Array.isArray(selectedRowAxeIds)) {
            return res.status(400).json({
                state: false,
                message: "Paramètres manquants ou invalides"
            });
        }

        const sections = await caSections.findAll({
            where: {
                id_compte,
                id_dossier,
                id_axe: selectedRowAxeIds
            },
            order: [['id', 'ASC']]
        });

        return res.status(200).json({
            state: true,
            data: sections,
            message: "Sections récupérées avec succès"
        });

    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

exports.addOrUpdateAxes = async (req, res) => {
    try {
        const { data } = req.body;
        const idCompte = parseInt(req.params.id_compte);
        const idDossier = parseInt(req.params.id_dossier);

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes ou invalides"
            });
        }

        if (isNaN(idCompte) || isNaN(idDossier)) {
            return res.status(400).json({
                state: false,
                message: "id_compte ou id_dossier invalide"
            });
        }

        const inserted = [];
        const updated = [];

        for (const row of data) {
            const { id, code, libelle } = row;

            if (!code?.trim() || !libelle?.trim()) {
                continue;
            }

            if (id < 0) {
                const newAxe = await caAxes.create({
                    code,
                    libelle,
                    id_compte: idCompte,
                    id_dossier: idDossier,
                });
                inserted.push(newAxe);
            } else {
                const [updatedCount] = await caAxes.update(
                    { code, libelle },
                    { where: { id: parseInt(id) } }
                );
                if (updatedCount > 0) {
                    updated.push(id);
                }
            }
        }

        return res.status(200).json({
            state: true,
            message: `Axes traités avec succès : ${inserted.length} ajouté(s), ${updated.length} modifié(s).`,
            inserted,
            updated
        });

    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

exports.addOrUpdateSections = async (req, res) => {
    try {
        const { data } = req.body;
        const idCompte = parseInt(req.params.id_compte);
        const idDossier = parseInt(req.params.id_dossier);

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes ou invalides"
            });
        }

        if (isNaN(idCompte) || isNaN(idDossier)) {
            return res.status(400).json({
                state: false,
                message: "id_compte ou id_dossier invalide"
            });
        }

        const inserted = [];
        const updated = [];

        for (const row of data) {
            const { id, section, intitule, compte, pourcentage, par_defaut, fermer, id_axe } = row;

            if (!section?.trim() || !intitule?.trim() || !compte?.trim()) {
                continue;
            }

            if (id < 0) {
                const newAxe = await caSections.create({
                    section,
                    intitule,
                    compte,
                    compte,
                    pourcentage,
                    par_defaut,
                    fermer,
                    id_axe,
                    id_compte: idCompte,
                    id_dossier: idDossier,
                });
                inserted.push(newAxe);
            } else {
                const [updatedCount] = await caSections.update(
                    {
                        section,
                        intitule,
                        compte,
                        compte,
                        pourcentage,
                        par_defaut,
                        fermer,
                    },
                    { where: { id: parseInt(id) } }
                );
                if (updatedCount > 0) {
                    updated.push(id);
                }
            }
        }

        return res.status(200).json({
            state: true,
            message: `Axes traités avec succès : ${inserted.length} ajouté(s), ${updated.length} modifié(s).`,
            inserted,
            updated
        });

    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
}

exports.deleteAxes = async (req, res) => {
    try {
        const { selectedRowAxeIds } = req.body;

        if (!selectedRowAxeIds || !Array.isArray(selectedRowAxeIds)) {
            return res.status(400).json({
                state: false,
                message: "Aucune ligne sélectionnée à supprimer"
            });
        }

        const result = await caAxes.destroy({
            where: { id: selectedRowAxeIds }
        });

        return res.status(200).json({
            state: true,
            message: `${result} ${pluralize(result, 'axe')} ${pluralize(result, 'supprimé')} avec succès`
        });

    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

exports.deleteSections = async (req, res) => {
    try {
        const { selectedRowSectionIds } = req.body;

        if (!selectedRowSectionIds || !Array.isArray(selectedRowSectionIds)) {
            return res.status(400).json({
                state: false,
                message: "Aucune ligne sélectionnée à supprimer"
            });
        }

        const result = await caSections.destroy({
            where: { id: selectedRowSectionIds }
        });

        return res.status(200).json({
            state: true,
            message: `${result} ${pluralize(result, 'section')} ${pluralize(result, 'supprimé')} avec succès`
        });

    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
}
