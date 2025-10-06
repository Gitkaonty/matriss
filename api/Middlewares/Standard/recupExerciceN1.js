const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const exercices = db.exercices;

const recupInfos = async (id_compte, id_dossier, id_exerciceN) => {
    try {
        // let id_exerciceN1 = 0;
        // let date_debutN1 = null;
        // let date_finN1 = null;
        // let date_finN1Prov = new Date();
        // let libelleExerciceN1 = '';
        // let rangN1 = '';
        // let clotureN1 = null;

        // const infosExerciceN = await exercices.findOne({
        //     where:
        //     {
        //         id: id_exerciceN,
        //         id_compte: id_compte,
        //         id_dossier: id_dossier
        //     }
        // });

        // if (infosExerciceN) {
        //     const dateDebut = new Date(infosExerciceN.date_debut); // conversion de la string en Date
        //     date_finN1Prov = new Date(dateDebut);

        //     date_finN1Prov.setDate(dateDebut.getDate() - 1);
        //     date_finN1Prov.setHours(0, 0, 0, 0);

        //     const infosExerciceN1 = await exercices.findOne({
        //         where:
        //         {
        //             id_compte: id_compte,
        //             id_dossier: id_dossier,
        //             date_fin: date_finN1Prov
        //         }
        //     });

        //     if (infosExerciceN1) {
        //         id_exerciceN1 = infosExerciceN1.id;
        //         date_debutN1 = infosExerciceN1.date_debut;
        //         date_finN1 = infosExerciceN1.date_fin;
        //         libelleExerciceN1 = infosExerciceN1.libelle_rang;
        //         rangN1 = infosExerciceN1.rang;
        //         clotureN1 = infosExerciceN1.rang;
        //     }
        // }

        // return { id_exerciceN1, date_debutN1, date_finN1, libelleExerciceN1, rangN1, clotureN1 }

        const currentExercice = await exercices.findByPk(id_exerciceN);

        const currentDebutExerciceN = currentExercice.date_debut;

        if (!currentDebutExerciceN) {
            return res.status(401).json({ message: 'Date de début d\'exercice non trouvée', state: false });
        }

        // Calcul date N-1
        const dateDebut = new Date(currentDebutExerciceN);
        dateDebut.setDate(dateDebut.getDate() - 1);

        const dateFinN1Formatted = dateDebut.toISOString().split('T')[0];

        // Chercher l'exercice N-1
        const n1Exercice = await exercices.findOne({
            where: {
                id_compte: Number(id_compte),
                id_dossier: Number(id_dossier),
                date_fin: { [Op.eq]: new Date(dateFinN1Formatted) }
            }
        });

        const id_exerciceN1 = n1Exercice?.id || null;

        return { id_exerciceN1 }

    } catch (error) {
        console.log(error);

        return {
            id_exerciceN1: 0,
            date_debutN1: null,
            date_finN1: null,
            libelleExerciceN1: '',
            rangN1: '',
            clotureN1: null
        };
    }
}

module.exports = { recupInfos }