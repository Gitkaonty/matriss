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
        const { selectedRowAxeId } = req.body;

        if (!id_compte || !id_dossier || !selectedRowAxeId || !Array.isArray(selectedRowAxeId)) {
            return res.status(400).json({
                state: false,
                message: "Paramètres manquants ou invalides"
            });
        }

        const sections = await caSections.findAll({
            where: {
                id_compte,
                id_dossier,
                id_axe: selectedRowAxeId
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
        const { id, code, compteId, fileId, libelle } = req.body;

        let resData = {
            state: false,
            msg: 'Une erreur est survenue au moment du traitement.',
        }

        if (!code || !compteId || !fileId || !libelle) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes ou invalides"
            });
        }

        const id_compte = parseInt(compteId);
        const id_dossier = parseInt(fileId);

        if (isNaN(id_compte) || isNaN(id_dossier)) {
            return res.status(400).json({
                state: false,
                message: "id_compte ou id_dossier invalide"
            });
        }

        const testIfExist = await caAxes.findAll({
            where: {
                id,
                id_compte,
                id_dossier
            }
        })

        if (testIfExist.length === 0) {
            const axeAdded = await caAxes.create({
                id_compte,
                id_dossier,
                code,
                libelle
            })

            if (axeAdded) {
                resData.state = true;
                resData.msg = "Nouvelle ligne sauvegardée avec succès.";
            } else {
                resData.state = false;
                resData.msg = "Une erreur est survenue au moment du traitement des données";
            }
        } else {
            const axeUpdated = await caAxes.update({
                code,
                libelle
            }, {
                where: { id }
            });
            if (axeUpdated) {
                resData.state = true;
                resData.msg = "Modification effectuée avec succès.";
            } else {
                resData.state = false;
                resData.msg = "Une erreur est survenue au moment du traitement des données";
            }
        }
        return res.json(resData);

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
        const { id, compte, compteId, fileId, axeId, intitule, pourcentage, section, fermer, par_defaut } = req.body;

        let resData = {
            state: false,
            msg: 'Une erreur est survenue au moment du traitement.',
        }

        if (!compte || !compteId || !fileId || !intitule || !pourcentage || !section) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes ou invalides"
            });
        }

        const id_compte = parseInt(compteId);
        const id_dossier = parseInt(fileId);
        const id_axe = parseInt(axeId);
        const pourcentageFormated = parseFloat(pourcentage).toFixed(2);

        if (isNaN(id_compte) || isNaN(id_dossier)) {
            return res.status(400).json({
                state: false,
                message: "id_compte ou id_dossier invalide"
            });
        }

        const testIfExist = await caSections.findAll({
            where: {
                id,
                id_compte,
                id_dossier,
                id_axe
            }
        })

        if (testIfExist.length === 0) {
            const sectionAdded = await caSections.create({
                id_compte,
                id_dossier,
                id_axe,
                compte,
                intitule,
                pourcentage: pourcentageFormated,
                section,
                fermer,
                par_defaut
            })

            if (sectionAdded) {
                resData.state = true;
                resData.msg = "Nouvelle ligne sauvegardée avec succès.";
            } else {
                resData.state = false;
                resData.msg = "Une erreur est survenue au moment du traitement des données";
            }
        } else {
            const sectionUpdated = await caSections.update({
                compte,
                intitule,
                pourcentage: pourcentageFormated,
                section,
                fermer,
                par_defaut
            }, {
                where: { id }
            });
            if (sectionUpdated) {
                resData.state = true;
                resData.msg = "Modification effectuée avec succès.";
            } else {
                resData.state = false;
                resData.msg = "Une erreur est survenue au moment du traitement des données";
            }
        }
        return res.json(resData);

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
        const { idToDelete } = req.body;

        let resData = {
            state: false,
            msg: 'Une erreur est survenue au moment du traitement.',
        }

        if (!idToDelete) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes ou invalides"
            });
        }

        const result = await caAxes.destroy({
            where: { id: idToDelete }
        });

        if (result) {
            resData.state = true;
            resData.msg = 'Axe supprimé avec succès';
        } else {
            resData.state = false;
            resData.msg = "Une erreur est survenue au moment du traitement des données.";
        }
        return res.json(resData);

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
        const { idToDelete } = req.body;

        let resData = {
            state: false,
            msg: 'Une erreur est survenue au moment du traitement.',
        }

        if (!idToDelete) {
            return res.status(400).json({
                state: false,
                message: "Aucune ligne sélectionnée à supprimer"
            });
        }

        const result = await caSections.destroy({
            where: { id: idToDelete }
        });

        if (result) {
            resData.state = true;
            resData.msg = 'Section supprimé avec succès';
        } else {
            resData.state = false;
            resData.msg = "Une erreur est survenue au moment du traitement des données.";
        }

        return res.json(resData);

    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
}
