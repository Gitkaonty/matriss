const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');

const caAxes = db.caAxes;
const caSections = db.caSections;
const analytiques = db.analytiques;

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

        if (!id_compte || !id_dossier || !selectedRowAxeId) {
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
        const rowId = parseInt(id);

        if (isNaN(id_compte) || isNaN(id_dossier)) {
            return res.status(400).json({
                state: false,
                message: "id_compte ou id_dossier invalide"
            });
        }

        const duplicate = await caAxes.findOne({
            where: {
                id_dossier,
                code,
                id: { [Sequelize.Op.ne]: rowId || 0 }
            }
        });

        if (duplicate) {
            return res.json({ state: false, msg: 'Ce code Axe existe déjà dans ce dossier.' });
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
        const newPourcentage = parseFloat(pourcentage);

        if (isNaN(id_compte) || isNaN(id_dossier)) {
            return res.status(400).json({
                state: false,
                message: "Compte ou dossier invalide"
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

        const pourcentageData = await caSections.findAll({
            where: {
                id_compte,
                id_dossier,
                id_axe
            },
            attributes: ['pourcentage', 'id']
        })

        const totalPourcentage = pourcentageData.reduce((sum, row) => {
            if (id && row.id === Number(id)) return sum;
            return sum + (row.pourcentage || 0);
        }, 0);

        const cumulPourcentage = totalPourcentage + newPourcentage;

        if (cumulPourcentage > 100) {
            resData.state = false;
            const valueToDisplay = cumulPourcentage - 100;
            resData.msg = `La valeur du pourcentage est augmenté de ${valueToDisplay}%`;
            return res.json(resData);
        }

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
            return res.status(200).json({
                state: false,
                message: "Données manquantes ou invalides"
            });
        }

        await caSections.destroy({ where: { id_axe: idToDelete } });
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

exports.getListAxeSection = async (req, res) => {
    try {
        const { id_dossier, id_compte } = req.params;
        if (!id_dossier || !id_compte) {
            return res.status(200).json({
                state: false,
                message: "Données manquantes ou invalides"
            });
        }
        const data = await caSections.findAll({
            where: {
                id_dossier,
                id_compte
            },
            include: [
                {
                    model: caAxes,
                    as: 'axe',
                    attributes: ['id', 'libelle', 'code'],
                    required: false
                }
            ],
            attributes: ['id', 'section', 'intitule', 'id_axe', 'compte', 'pourcentage'],
            order: [
                ['id_axe', 'ASC'],
                ['id', 'ASC']
            ]
        });

        const result = data.map(item => ({
            id_axe: item.id_axe,
            libelle_axe: item.axe?.libelle,
            code_axe: item.axe?.code,
            compte_axe: item.compte,
            pourcentage: item.pourcentage,
            intitule_section: item.intitule,
            id_section: item.id,
            section: item.section,
        }));

        return res.json(result);

    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
}

exports.getRepartitionCA = async (req, res) => {
    const { id_journal } = req.params;

    if (!id_journal) {
        return res.status(200).json({
            state: false,
            message: "Données manquantes ou invalides"
        });
    }

    try {
        const rows = await analytiques.findAll({
            where: { id_ligne_ecriture: id_journal },
            include: [
                {
                    model: caAxes,
                    as: 'axe',
                    attributes: ['id', 'libelle', 'code'],
                },
                {
                    model: caSections,
                    as: 'section',
                    attributes: ['id', 'intitule', 'section', 'compte', 'pourcentage'],
                }
            ],
            order: [['id_axe', 'ASC'], ['id_section', 'ASC']]
        });

        const result = rows.map(r => ({
            id_compte: Number(r.id_compte),
            id_dossier: Number(r.id_dossier),
            id_exercice: Number(r.id_exercice),
            id_ligne_ecriture: Number(r.id_ligne_ecriture),
            id_axe: Number(r.id_axe),
            libelle_axe: r.axe?.libelle || '',
            code_axe: r.axe?.code || '',
            compte_axe: r.section?.compte || '',
            pourcentage: r.pourcentage || 0,
            id_section: Number(r.id_section),
            intitule_section: r.section?.intitule || '',
            section: r.section?.section || '',
            debit: r.debit,
            credit: r.credit,
        }));

        return res.status(200).json({ state: true, list: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            state: false,
            message: "Erreur lors de la récupération des données"
        });
    }
};