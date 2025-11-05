const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');

const codejournals = db.codejournals;
const Dossier = db.dossiers;
const journals = db.journals;

const getListeCodeJournaux = async (req, res) => {
  try {
    const id_dossier = req.params.id;

    let resData = {
      state: false,
      msg: 'une erreur est survenue lors du traitement.',
      list: []
    }

    const list = await codejournals.findAll({
      where: {
        id_dossier
      },
      order: [['code', 'DESC']]
    });

    if (list) {
      resData.state = true;
      resData.list = list;
    } else {
      resData.state = false;
      resData.msg = 'une erreur est survenue lors du traitement.';
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const addCodeJournal = async (req, res) => {
  try {
    const { idCompte, idDossier, idCode, code, libelle, type, compteassocie, nif, stat, adresse } = req.body;

    let resData = {
      state: false,
      msg: 'Une erreur est survenue au moment du traitement.',
    }

    const testIfExist = await codejournals.findAll({
      where: { id: idCode, id_dossier: idDossier }
    });

    if (testIfExist.length === 0) {
      // Vérifier doublon à la création
      const duplicateCreate = await codejournals.findOne({
        where: { id_dossier: idDossier, code: code }
      });
      if (duplicateCreate) {
        resData.state = false;
        resData.msg = "Ce code journal existe déjà.";
        return res.json(resData);
      }
      const addCode = await codejournals.create({
        id_compte: idCompte,
        id_dossier: idDossier,
        code: code,
        libelle: libelle,
        type: type,
        compteassocie: compteassocie,
        nif: nif,
        stat: stat,
        adresse: adresse
      });

      if (addCode) {
        resData.state = true;
        resData.msg = "Code journal sauvegardé avec succès.";
      } else {
        resData.state = false;
        resData.msg = "Une erreur est survenue au moment du traitement des données";
      }
    } else {
      // Vérifier doublon à la mise à jour (exclure l'enregistrement courant)
      const duplicateUpdate = await codejournals.findOne({
        where: {
          id_dossier: idDossier,
          code: code,
          id: { [Sequelize.Op.ne]: idCode }
        }
      });
      if (duplicateUpdate) {
        resData.state = false;
        resData.msg = "Ce code journal existe déjà.";
        return res.json(resData);
      }
      const ModifyCode = await codejournals.update(
        {
          id_compte: idCompte,
          id_dossier: idDossier,
          code: code,
          libelle: libelle,
          type: type,
          compteassocie: compteassocie,
          nif: nif,
          stat: stat,
          adresse: adresse
        },
        {
          where: { id: idCode }
        }
      );

      if (ModifyCode) {
        resData.state = true;
        resData.msg = "Modification effectuée avec succès.";
      } else {
        resData.state = false;
        resData.msg = "Une erreur est survenue au moment du traitement des données";
      }
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const codeJournauxDelete = async (req, res) => {
  try {
    const { fileId, compteId, idToDelete } = req.body;
    const fileIdNum = Number(fileId);
    const compteIdNum = Number(compteId);
    const idToDeleteNum = Number(idToDelete);

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    // console.log('[codeJournauxDelete] Input parsed', { fileIdNum, compteIdNum, idToDeleteNum });

    // Vérifier l'utilisation dans la table journals (sans filtrer par exercice)
    const usageCount = await journals.count({
      where: {
        id_compte: compteIdNum,
        id_dossier: fileIdNum,
        id_journal: idToDeleteNum
      }
    });

    // console.log('[codeJournauxDelete] Journals usageCount', usageCount);

    if (usageCount > 0) {
      resData.state = false;
      resData.msg = "Impossible de supprimer ce code journal: il est utilisé dans des écritures.";
      // console.log('[codeJournauxDelete] Deletion blocked due to usage');
      return res.json(resData);
    }

    // console.log('[codeJournauxDelete] Attempt destroy (id,id_dossier,id_compte)');
    let deletedCodeJournal = await codejournals.destroy({
      where: {
        id: idToDeleteNum,
        id_dossier: fileIdNum,
        id_compte: compteIdNum
      }
    });
    // console.log('[codeJournauxDelete] First destroy affected rows', deletedCodeJournal);
    // on retente la suppression en se basant sur (id, id_dossier) uniquement.
    if (!deletedCodeJournal) {
      // console.log('[codeJournauxDelete] Fallback destroy (id,id_dossier)');
      deletedCodeJournal = await codejournals.destroy({
        where: {
          id: idToDeleteNum,
          id_dossier: fileIdNum,
        }
      });
      // console.log('[codeJournauxDelete] Fallback destroy affected rows', deletedCodeJournal);
    }

    if (deletedCodeJournal) {
      resData.state = true;
      resData.msg = "Code journal supprimé avec succès.";
      // console.log('[codeJournauxDelete] Deletion success');
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données.";
      // console.warn('[codeJournauxDelete] No rows deleted');
    }

    return res.json(resData);
  } catch (error) {
    console.error('[codeJournauxDelete] Error', error);
  }
}

module.exports = {
  getListeCodeJournaux,
  addCodeJournal,
  codeJournauxDelete
};