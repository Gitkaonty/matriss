const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');

const listecodetvas = db.listecodetvas;
const paramtvas = db.paramtvas;
const dossierplancomptables = db.dossierplancomptable;

paramtvas.belongsTo(dossierplancomptables, { foreignKey: 'id_cptcompta' });
dossierplancomptables.hasMany(paramtvas, { foreignKey: 'id_cptcompta' });

paramtvas.belongsTo(listecodetvas, { foreignKey: 'type' });
listecodetvas.hasMany(paramtvas, { foreignKey: 'type' });

const getListeCodeTva = async (req, res) => {
  try {

    let resData = {
      state: false,
      msg: 'une erreur est survenue lors du traitement.',
      list: []
    }

    const listeCodeTva = await listecodetvas.findAll({
      order: [['code', 'ASC']]
    });

    if (listeCodeTva) {
      resData.state = true;
      resData.list = listeCodeTva;
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const listeParamTva = async (req, res) => {
  try {
    const fileId = req.params.id;

    let resData = {
      state: false,
      msg: 'une erreur est survenue lors du traitement.',
      list: []
    }

    const listeParamTva = await paramtvas.findAll({
      where: {
        id_dossier: fileId
      },
      include: [
        {
          model: dossierplancomptables,
          attributes: [
            ['compte', 'compte'],
            ['libelle', 'libelle']
          ],
        },
        {
          model: listecodetvas,
          attributes: [
            ['code', 'code'],
            ['libelle', 'libelle']
          ],
        }
      ],
      raw: true
      //order: [['dossierplancomptable.compte', 'ASC']]
    });

    if (listeParamTva) {
      resData.state = true;
      resData.list = listeParamTva;
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const paramTvaAdd = async (req, res) => {
  try {
    const { idCompte, idDossier, idCode, compte, libelle, code } = req.body;

    let resData = {
      state: false,
      msg: 'Une erreur est survenue au moment du traitement.',
    }

    const testIfExist = await paramtvas.findAll({
      where: { id: idCode, id_dossier: idDossier }
    });

    if (testIfExist.length === 0) {
      const addCode = await paramtvas.create({
        id_compte: idCompte,
        id_dossier: idDossier,
        id_cptcompta: compte,
        type: code,
      });

      if (addCode) {
        resData.state = true;
        resData.msg = "Paramétrage tva sauvegardé avec succès.";
      } else {
        resData.state = false;
        resData.msg = "Une erreur est survenue au moment du traitement des données";
      }
    } else {
      const ModifyCode = await paramtvas.update(
        {
          id_compte: idCompte,
          id_dossier: idDossier,
          id_cptcompta: compte,
          type: code,
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

const paramTvaDelete = async (req, res) => {
  try {
    const { fileId, compteId, idToDelete } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const deletedParamTva = await paramtvas.destroy({
      where: {
        id: idToDelete,
        id_dossier: fileId,
        id_compte: compteId
      }
    });

    if (deletedParamTva) {
      resData.state = true;
      resData.msg = "Paramétrage tva supprimé avec succès.";
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
  getListeCodeTva,
  listeParamTva,
  paramTvaAdd,
  paramTvaDelete
};