const db = require("../../Models");
require('dotenv').config();
const { Op } = require('sequelize');

const rubriques = db.rubriques;
const rubriquesmatrices = db.rubriquesmatrices;

const liassebhiapcs = db.liassebhiapcs;
const liassedas = db.liassedas;
const liassedps = db.liassedps;
const liassedrfs = db.liassedrfs;
const liasseeiafncs = db.liasseeiafncs;
const liasseevcps = db.liasseevcps;
const liassempautres = db.liassempautres;
const liassemps = db.liassemps;
const liassenotes = db.liassenotes;
const liassesads = db.liassesads;
const liassesdrs = db.liassesdrs;
const liasseses = db.liasseses;

rubriques.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
//rubriquesmatrices.hasMany(rubriques, { foreignKey: 'id_rubrique' });

liassebhiapcs.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liassedas.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liassedps.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liassedrfs.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liasseeiafncs.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liasseevcps.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liassempautres.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liassemps.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liassenotes.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liassesads.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liassesdrs.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
liasseses.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });

const deleteAllRowBHIAPC = async (compteId, fileId, exerciceId) => {
  try {
    let stateDeleting = false;

    if (liassebhiapcs.destroy({
      where:
      {
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
      }
    })
    ) {
      stateDeleting = true;
    }

    return stateDeleting;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const deleteAllRowMP = async (compteId, fileId, exerciceId) => {
  try {
    let stateDeleting = false;

    if (liassemps.destroy({
      where:
      {
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
      }
    })
    ) {
      stateDeleting = true;
    }

    return stateDeleting;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const deleteAllRowDA = async (compteId, fileId, exerciceId) => {
  try {
    let stateDeleting = false;

    if (liassedas.destroy({
      where:
      {
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
      }
    })
    ) {
      stateDeleting = true;
    }

    return stateDeleting;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const deleteAllRowDP = async (compteId, fileId, exerciceId) => {
  try {
    let stateDeleting = true;

    await liassedps.destroy({
      where: {
        id_compte: Number(compteId),
        id_dossier: Number(fileId),
        id_exercice: Number(exerciceId),
      }
    })

    const listeRubriqueDP = await rubriquesmatrices.findAll({
      where:
      {
        id_etat: "DP",
      }
    });

    if (listeRubriqueDP.length > 0) {
      listeRubriqueDP.map((item) => {
        liassedps.create({
          id_compte: Number(compteId),
          id_dossier: Number(fileId),
          id_exercice: Number(exerciceId),
          id_etat: item.id_etat,
          id_rubrique: item.id_rubrique,
          libelle: item.libelle,
          nature_prov: item.nature,
          ordre: item.ordre,
          niveau: item.niveau,
        });
      });
    }

    return stateDeleting;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const deleteAllRowEIAFNC = async (compteId, fileId, exerciceId) => {
  try {
    let stateDeleting = false;

    if (await liasseeiafncs.destroy({
      where:
      {
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
      }
    })
    ) {
      stateDeleting = true;
    }

    return stateDeleting;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const deleteAllRowSE = async (compteId, fileId, exerciceId) => {
  try {
    let stateDeleting = false;

    if (await liasseses.destroy({
      where:
      {
        id_compte: parseInt(compteId, 10),
        id_dossier: parseInt(fileId, 10),
        id_exercice: parseInt(exerciceId, 10),
      }
    })
    ) {
      stateDeleting = true;
    }

    return stateDeleting;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const deleteAllRowNE = async (compteId, fileId, exerciceId) => {
  try {
    let stateDeleting = false;

    if (await liassenotes.destroy({
      where:
      {
        id_compte: parseInt(compteId, 10),
        id_dossier: parseInt(fileId, 10),
        id_exercice: parseInt(exerciceId, 10),
      }
    })
    ) {
      stateDeleting = true;
    }

    return stateDeleting;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  deleteAllRowBHIAPC,
  deleteAllRowMP,
  deleteAllRowDA,
  deleteAllRowDP,
  deleteAllRowEIAFNC,
  deleteAllRowSE,
  deleteAllRowNE
};


