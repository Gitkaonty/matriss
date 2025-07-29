const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');

const codejournals = db.codejournals;

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
    const { idCompte, idDossier, idCode, code, libelle, type, compteassocie } = req.body;

    let resData = {
      state: false,
      msg: 'Une erreur est survenue au moment du traitement.',
    }

    const testIfExist = await codejournals.findAll({
      where: { id: idCode, id_dossier: idDossier }
    });

    if (testIfExist.length === 0) {
      const addCode = await codejournals.create({
        id_compte: idCompte,
        id_dossier: idDossier,
        code: code,
        libelle: libelle,
        type: type,
        compteassocie: compteassocie
      });

      if (addCode) {
        resData.state = true;
        resData.msg = "Code journal sauvegardé avec succès.";
      } else {
        resData.state = false;
        resData.msg = "Une erreur est survenue au moment du traitement des données";
      }
    } else {
      const ModifyCode = await codejournals.update(
        {
          id_compte: idCompte,
          id_dossier: idDossier,
          code: code,
          libelle: libelle,
          type: type,
          compteassocie: compteassocie
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

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const deletedCodeJournal = await codejournals.destroy({
      where: {
        id: idToDelete,
        id_dossier: fileId,
        id_compte: compteId
      }
    });

    if (deletedCodeJournal) {
      resData.state = true;
      resData.msg = "Code journal supprimé avec succès.";
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données.";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getListeCodeJournaux,
  addCodeJournal,
  codeJournauxDelete
};