require('dotenv').config();
const bcrypt = require("bcrypt");
const db = require("../../../Models");
const { Op } = require('sequelize');

const Sequelize = require('sequelize');
const fs = require('fs');

const userscomptes = db.userscomptes;

exports.getAllComptes = async (req, res) => {
    try {
        const comptes = await userscomptes.findAll({})
        if (!comptes) {
            return res.status(409).json({ message: 'Comptes non trouvés', state: false })
        }
        return res.status(200).json({ message: "Comptes reçues aves succès", state: true, list: comptes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.addCompte = async (req, res) => {
    try {
        const { nom, email } = req.body;
        if (!nom || !email) {
            return res.status(409).json({ message: 'Nom ou email non reçues', state: false })
        }

        // Vérification des doublons
        const duplicate = await userscomptes.findOne({
            where: { email }
        });

        if (duplicate) {
            return res.status(409).json({
                message: 'Cet email existe déjà. Veuillez saisir un nouvel email',
                state: false
            });
        }
        
        await userscomptes.create({
            nom,
            email
        })
        return res.status(200).json({ message: "Compte ajouté avec succès", state: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.deleteSelectedCompte = async (req, res) => {
    try {
        const { compteIds } = req.body;

        if (!Array.isArray(compteIds)) {
            return res.status(409).json({ message: 'Ids des comptes non trouvé', state: false });
        }

        const result = await userscomptes.destroy({
            where: {
                id: compteIds
            }
        })

        return res.status(200).json({
            state: true,
            message: `${result} compte(s) supprimé(s) avec succès`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}