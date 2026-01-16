const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const { sequelize } = require('../../Models');

const modelePlanComptable = db.modelePlanComptable;
const modeleplancomptabledetail = db.modeleplancomptabledetail;

const testModelePcName = async (req, res) => {
  try {
    const { compteId, modeleName } = req.body;

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    //création des comptes généraux


    //récuperer la liste à jour des codes journaux
    const updatedList = await modelePlanComptable.findAll({
      where:
      {
        id_compte: compteId,
        nom: modeleName
      },
      raw: true,
    });

    if (updatedList.length > 0) {
      resData.state = true;
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const importModelePc = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { idCompte, nomModele, modelePcData } = req.body;

    if (!Array.isArray(modelePcData) || modelePcData.length === 0) {
      return res.json({
        state: false,
        msg: "Aucune donnée à importer",
        list: [],
        nbrligne: 0
      });
    }

    const modeleName = await modelePlanComptable.create(
      {
        id_compte: idCompte,
        nom: nomModele,
        par_default: false
      },
      { transaction }
    );

    const rowsToInsert = modelePcData.map(item => {
      let dateCin = null;

      if (item.datecin && typeof item.datecin === "string" && item.datecin.includes("/")) {
        const [day, month, year] = item.datecin.split("/");
        dateCin = new Date(`${year}-${month}-${day}`);
      }

      return {
        id_compte: idCompte,
        id_modeleplancomptable: modeleName.id,
        compte: item.compte?.trim(),
        libelle: item.libelle?.trim(),
        nature: item.nature,
        baseaux: item.baseaux,
        typetier: item.typetier,
        cptcharge: 0,
        cpttva: 0,
        nif: item.nif,
        statistique: item.statistique,
        adresse: item.adresse,
        motcle: "",
        cin: item.cin,
        datecin: dateCin,
        autrepieceid: item.autrepieceidentite,
        refpieceid: item.refpieceidentite,
        adressesansnif: item.adressesansnif,
        nifrepresentant: item.nifrepresentant,
        adresseetranger: item.adresserepresentant,
        pays: item.pays?.trim() || "Madagascar",
        province: item.province || "",
        region: item.region || "",
        district: item.district || "",
        commune: item.commune || ""
      };
    });

    await modeleplancomptabledetail.bulkCreate(rowsToInsert, { transaction });

    await sequelize.query(
      `
      UPDATE modeleplancomptabledetails A
      SET baseaux_id = B.id
      FROM modeleplancomptabledetails B
      WHERE A.baseaux = B.compte
        AND A.id_compte = :idCompte
        AND A.id_modeleplancomptable = :modeleId
        AND B.id_compte = :idCompte
        AND B.id_modeleplancomptable = :modeleId
      `,
      {
        replacements: {
          idCompte,
          modeleId: modeleName.id
        },
        transaction
      }
    );

    await transaction.commit();

    return res.json({
      state: true,
      msg: `${rowsToInsert.length} lignes ont été importées avec succès`,
      list: [],
      nbrligne: rowsToInsert.length
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Erreur import modèle PC :", error);

    return res.status(500).json({
      state: false,
      msg: "Erreur lors de l'import du modèle",
      error: error.message
    });
  }
};

module.exports = {
  testModelePcName,
  importModelePc
};