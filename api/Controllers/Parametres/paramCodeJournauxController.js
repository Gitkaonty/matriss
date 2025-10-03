const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');

const codejournals = db.codejournals;
const Dossier = db.dossiers;

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

    // Rules for BANQUE vs others
    let effNif = '';
    let effStat = '';
    let effAdresse = '';
    if (String(type).toUpperCase() === 'BANQUE') {
      // If missing, prefill from dossier
      let dnif = '', dstat = '', dadresse = '';
      try {
        const dossier = await Dossier.findByPk(idDossier);
        if (dossier) {
          const o = typeof dossier.toJSON === 'function' ? dossier.toJSON() : dossier;
          dnif = o?.nif || '';
          dstat = o?.stat || '';
          dadresse = o?.adresse || '';
        }
      } catch (e) {}
      effNif = (nif && String(nif).trim() !== '') ? nif : dnif;
      effStat = (stat && String(stat).trim() !== '') ? stat : dstat;
      effAdresse = (adresse && String(adresse).trim() !== '') ? adresse : dadresse;
    } else {
      // Not BANQUE: force empty values
      effNif = '';
      effStat = '';
      effAdresse = '';
    }

    if (testIfExist.length === 0) {
      const addCode = await codejournals.create({
        id_compte: idCompte,
        id_dossier: idDossier,
        code: code,
        libelle: libelle,
        type: type,
        compteassocie: compteassocie,
        nif: effNif,
        stat: effStat,
        adresse: effAdresse
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
          compteassocie: compteassocie,
          nif: effNif,
          stat: effStat,
          adresse: effAdresse
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