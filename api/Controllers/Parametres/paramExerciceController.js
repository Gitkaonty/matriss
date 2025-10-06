const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const exercice = db.exercices;

const etats = db.etats;
const etatsmatrices = db.etatsmatrices;
const etatsplp = db.etatsplp;

const etatscomms = db.etatscomms;
const etatscomatrices = db.etatscomatrices;
const etatsplpmatrices = db.etatsplpmatrices;

const rubriques = db.rubriques;
const rubriquesmatrices = db.rubriquesmatrices;
const compterubriques = db.compterubriques;
const compterubriquematrices = db.compterubriquematrices;
const situations = db.situations;

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

const getListeExercice = async (req, res) => {
  try {
    const fileId = req.params.id;

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    const list = await exercice.findAll({
      where: {
        id_dossier: fileId
      },
      raw: true,
      order: [['date_fin', 'DESC']]
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

const getListeSituation = async (req, res) => {
  try {
    const exerciceId = req.params.id;

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    const list = await situations.findAll({
      where: {
        id_exercice: exerciceId
      },
      raw: true,
      order: [['date_fin', 'DESC']]
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

const copydata = async (id_compte, id_dossier, createExercice, action) => {
  //copier Etats, les rubriques et les comptes rubriques

  const listeEtat = await etatsmatrices.findAll({});
  const listeEtatComm = await etatscomatrices.findAll({});
  const listeEtatPlp = await etatsplpmatrices.findAll({});
  const listeRubrique = await rubriquesmatrices.findAll({});
  const listeCompteRubrique = await compterubriquematrices.findAll({});

  const createdExerciceInfosData = await exercice.findOne({
    where: { id: createExercice.id }
  });

  let id_exerciceRef = 0;
  if (createdExerciceInfosData) {
    const createdExerciceInfos = createdExerciceInfosData;
    const date_debut = new Date(createdExerciceInfos.date_debut);
    if (action === 'NEXT') {
      const ExerciceRef = await exercice.findOne({
        where: {
          date_debut: {
            [Op.lt]: date_debut
          }
        },
        order: [['date_debut', 'DESC']]
      });

      id_exerciceRef = ExerciceRef.id;
    } else if (action === 'PREV') {
      const ExerciceRef = await exercice.findOne({
        where: {
          date_debut: {
            [Op.gt]: date_debut
          }
        },
        order: [['date_debut', 'ASC']]
      });

      id_exerciceRef = ExerciceRef.id;
    }
  }

  // let listeCompteRubrique = [];
  // if (action === 'FIRST') {
  //   listeCompteRubrique = await compterubriquematrices.findAll({});
  // } else {
  //   listeCompteRubrique = await compterubriques.findAll({
  //     where: { id_compte: id_compte, id_dossier: id_dossier, id_exercice: id_exerciceRef }
  //   });
  // }

  listeEtat.map(async (item) => {
    await etats.create({
      id_compte: id_compte,
      id_dossier: id_dossier,
      id_exercice: createExercice.id,
      code: item.code,
      nom: item.nom,
      ordre: item.ordre,
    });
  });

  listeEtatComm.map(async (item) => {
    await etatscomms.create({
      id_compte: id_compte,
      id_dossier: id_dossier,
      id_exercice: createExercice.id,
      code: item.code,
      nom: item.nom,
      ordre: item.ordre,
    })
  })

  listeEtatPlp.map(async (item) => {
    await etatsplp.create({
      id_compte: id_compte,
      id_dossier: id_dossier,
      id_exercice: createExercice.id,
      code_cn: item.code_cn,
      nature_produit: item.nature_produit,
      unite_quantite: item.unite_quantite,
      commercant_quantite: item.commercant_quantite,
      commercant_valeur: item.commercant_valeur,
      producteur_quantite: item.producteur_quantite,
      producteur_valeur: item.producteur_valeur,
    })
  })

  listeCompteRubrique.map(async (item) => {
    await compterubriques.create({
      id_compte: id_compte,
      id_dossier: id_dossier,
      id_exercice: createExercice.id,
      id_etat: item.id_etat,
      id_rubrique: item.id_rubrique,
      compte: item.compte,
      nature: item.nature,
      senscalcul: item.senscalcul,
      condition: item.condition,
      equation: item.equation,
      par_default: item.par_default,
      active: item.active,
      exercice: item.exercice,
    })
  })

  listeRubrique.map(async (item) => {
    const copyrubriques = await rubriques.create({
      id_compte: id_compte,
      id_dossier: id_dossier,
      id_exercice: createExercice.id,
      id_etat: item.id_etat,
      subtable: item.subtable,
      id_rubrique: item.id_rubrique,
      nature: item.nature,
      note: item.note,
      ordre: item.ordre,
      niveau: item.niveau,
      senscalcul: item.senscalcul
    });
  });

  //copie infos EVCP vers la table liassesEVCP
  const listeRubriqueEVCP = await rubriquesmatrices.findAll({
    where:
    {
      id_etat: "EVCP"
    }
  });

  if (listeRubriqueEVCP.length > 0) {
    listeRubriqueEVCP.map((item) => {
      liasseevcps.create({
        id_compte: id_compte,
        id_dossier: id_dossier,
        id_exercice: createExercice.id,
        id_etat: item.id_etat,
        id_rubrique: item.id_rubrique,
        note: item.note,
        nature: item.nature,
        ordre: item.ordre,
        niveau: item.niveau,
      });
    });
  }

  //copie infos DRF vers la table liassesDRF
  const listeRubriqueDRF = await rubriquesmatrices.findAll({
    where:
    {
      id_etat: "DRF"
    }
  });

  if (listeRubriqueDRF.length > 0) {
    listeRubriqueDRF.map((item) => {
      liassedrfs.create({
        id_compte: id_compte,
        id_dossier: id_dossier,
        id_exercice: createExercice.id,
        id_etat: item.id_etat,
        id_rubrique: item.id_rubrique,
        note: item.note,
        nature: item.nature,
        signe: item.senscalcul,
        ordre: item.ordre,
        niveau: item.niveau,
      });
    });
  }

  //copie infos DP vers la table liassesdp
  const listeRubriqueDP = await rubriquesmatrices.findAll({
    where:
    {
      id_etat: "DP",
      // nature: { [Op.in]: ['RISQUE', 'DEPRECIATION'] },
    }
  });

  if (listeRubriqueDP.length > 0) {
    listeRubriqueDP.map((item) => {
      const dp = liassedps.create({
        id_compte: id_compte,
        id_dossier: id_dossier,
        id_exercice: createExercice.id,
        id_etat: item.id_etat,
        id_rubrique: item.id_rubrique,
        libelle: item.libelle,
        nature_prov: item.nature,
        ordre: item.ordre,
        niveau: item.niveau,
      });
    });
  }

  //copie infos SAD vers la table liassesSAD
  const listeRubriqueSAD = await rubriquesmatrices.findAll({
    where:
    {
      id_etat: "SAD"
    }
  });

  if (listeRubriqueSAD.length > 0) {
    listeRubriqueSAD.map((item) => {
      liassesads.create({
        id_compte: id_compte,
        id_dossier: id_dossier,
        id_exercice: createExercice.id,
        id_etat: item.id_etat,
        id_rubrique: item.id_rubrique,
        libelle: item.libelle,
        nature: item.nature,
        ordre: item.ordre,
        niveau: item.niveau,
      });
    });
  }

  //copie infos SDR vers la table liassesSDR
  const listeRubriqueSDR = await rubriquesmatrices.findAll({
    where:
    {
      id_etat: "SDR"
    }
  });

  if (listeRubriqueSDR.length > 0) {
    listeRubriqueSDR.map((item) => {
      liassesdrs.create({
        id_compte: id_compte,
        id_dossier: id_dossier,
        id_exercice: createExercice.id,
        id_etat: item.id_etat,
        id_rubrique: item.id_rubrique,
        libelle: item.libelle,
        nature: item.nature,
        ordre: item.ordre,
        niveau: item.niveau,
      });
    });
  }

  // listeCompteRubrique.map(async (item) => {
  //   const copycompterubriques = await compterubriques.create({
  //     id_compte: id_compte,
  //     id_dossier: id_dossier,
  //     id_exercice: createExercice.id,
  //     id_etat: item.id_etat,
  //     id_rubrique: item.id_rubrique,
  //     compte: item.compte,
  //     nature: item.nature,
  //     senscalcul: item.senscalcul,
  //     condition: item.condition,
  //     equation: item.equation,
  //     par_default: item.par_default,
  //     active: item.active,
  //     exercice: item.exercice,
  //   });
  // });
}

const createFirstExercice = async (req, res) => {
  try {
    const { id_compte, id_dossier, date_debut, date_fin } = req.body;

    let resData = {
      state: false,
      msg: '',
      fileInfos: []
    }

    const createExercice = await exercice.create({
      id_compte: id_compte,
      id_dossier: id_dossier,
      date_debut: date_debut,
      date_fin: date_fin,
      libelle_rang: 'N',
      rang: 0,
      cloture: false
    });

    //copier Etats, les rubriques et les comptes rubriques
    await copydata(id_compte, id_dossier, createExercice, 'FIRST');

    if (createExercice) {
      resData.state = true;
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const createNextExercice = async (req, res) => {
  try {
    const { compteId, fileId } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const lastExercice = await exercice.findOne({
      where: { id_compte: compteId, id_dossier: fileId },
      order: [['date_fin', 'DESC']]
    });

    if (lastExercice) {
      const date_debutNext = new Date(lastExercice.date_fin);
      const date_finNext = new Date(lastExercice.date_fin);

      date_debutNext.setDate(date_debutNext.getDate() + 1);
      date_finNext.setMonth(date_finNext.getMonth() + 12);

      const rang = lastExercice.rang + 1;

      let libelle_rang = '';
      if (rang === 0) {
        libelle_rang = 'N';
      } else if (rang > 0) {
        libelle_rang = `N+${rang}`;
      } else {
        libelle_rang = `N${rang}`;
      }

      const createExerciceNext = await exercice.create({
        id_compte: compteId,
        id_dossier: fileId,
        date_debut: date_debutNext,
        date_fin: date_finNext,
        libelle_rang: libelle_rang,
        rang: rang,
        cloture: false
      });

      //copier Etats, les rubriques et les comptes rubriques
      await copydata(compteId, fileId, createExerciceNext, 'NEXT');

      if (createExerciceNext) {
        resData.state = true;
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

const createPreviewExercice = async (req, res) => {
  try {
    const { compteId, fileId } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const LastExercice = await exercice.findOne({
      where: { id_compte: compteId, id_dossier: fileId },
      order: [['date_debut', 'ASC']]
    });

    if (LastExercice) {
      const date_debutPreview = new Date(LastExercice.date_debut);
      const date_finPreview = new Date(LastExercice.date_debut);

      date_debutPreview.setMonth(date_debutPreview.getMonth() - 12);
      date_finPreview.setDate(date_finPreview.getDate() - 1);

      const rang = LastExercice.rang - 1;

      let libelle_rang = '';
      if (rang === 0) {
        libelle_rang = 'N';
      } else if (rang > 0) {
        libelle_rang = `N+${rang}`;
      } else {
        libelle_rang = `N${rang}`;
      }

      const createExercicePreview = await exercice.create({
        id_compte: compteId,
        id_dossier: fileId,
        date_debut: date_debutPreview,
        date_fin: date_finPreview,
        libelle_rang: libelle_rang,
        rang: rang,
        cloture: true
      });

      //copier Etats, les rubriques et les comptes rubriques
      await copydata(compteId, fileId, createExercicePreview, 'PREV');

      if (createExercicePreview) {
        resData.state = true;
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

const verrouillerExercice = async (req, res) => {
  try {
    const { id_exercice, fileId } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const VerrExercice = await exercice.update(
      { cloture: true },
      { where: { id: id_exercice } }
    );

    const updateRang = await exercice.update(
      { rang: Sequelize.literal('rang - 1') },
      { where: { id_dossier: fileId } }
    );

    if (updateRang) {
      const listeEx = await exercice.findAll({
        where: { id_dossier: fileId }
      });

      if (listeEx) {
        await listeEx.map(async (item) => {
          let libelle_rang = '';
          if (item.rang === 0) {
            libelle_rang = 'N';
          } else if (item.rang > 0) {
            libelle_rang = `N+${item.rang}`;
          } else {
            libelle_rang = `N${item.rang}`;
          }

          await exercice.update(
            { libelle_rang: libelle_rang },
            { where: { id: item.id } }
          );
        });
      }
    }

    if (VerrExercice) {
      resData.state = true;
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const deverrouillerExercice = async (req, res) => {
  try {
    const { id_exercice, fileId } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const deverrExercice = await exercice.update(
      { cloture: false },
      { where: { id: id_exercice } }
    );

    const updateRang = await exercice.update(
      { rang: Sequelize.literal('rang + 1') },
      { where: { id_dossier: fileId } }
    );

    if (updateRang) {
      const listeEx = await exercice.findAll({
        where: { id_dossier: fileId }
      });

      if (listeEx) {
        await listeEx.map(async (item) => {
          let libelle_rang = '';
          if (item.rang === 0) {
            libelle_rang = 'N';
          } else if (item.rang > 0) {
            libelle_rang = `N+${item.rang}`;
          } else {
            libelle_rang = `N${item.rang}`;
          }

          await exercice.update(
            { libelle_rang: libelle_rang },
            { where: { id: item.id } }
          );
        });
      }
    }

    if (deverrExercice) {
      resData.state = true;
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const deleteExercice = async (req, res) => {
  try {
    const { id_exerciceToDelete, fileId, rang } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const deletedExercice = await exercice.destroy({
      where: { id: id_exerciceToDelete, id_dossier: fileId }
    });

    //supprimer les data paramétrages
    await etats.destroy({
      where: { id_exercice: id_exerciceToDelete, id_dossier: fileId }
    });

    await rubriques.destroy({
      where: { id_exercice: id_exerciceToDelete, id_dossier: fileId }
    });

    await compterubriques.destroy({
      where: { id_exercice: id_exerciceToDelete, id_dossier: fileId }
    });

    if (rang === 0) {
      await exercice.update(
        { rang: Sequelize.literal('rang - 1') },
        { where: { id_dossier: fileId } }
      );

      const listeEx = await exercice.findAll({
        where: { id_dossier: fileId }
      });

      if (listeEx) {
        await listeEx.map(async (item) => {
          let libelle_rang = '';
          if (item.rang === 0) {
            libelle_rang = 'N';
          } else if (item.rang > 0) {
            libelle_rang = `N+${item.rang}`;
          } else {
            libelle_rang = `N${item.rang}`;
          }

          await exercice.update(
            { libelle_rang: libelle_rang },
            { where: { id: item.id } }
          );
        });
      }
    }

    if (deletedExercice) {
      resData.state = true;
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const getListeExerciceById = async (req, res) => {
  try {
    const fileId = req.params.id;

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    const list = await exercice.findByPk(fileId)

    if (list) {
      resData.state = true;
      resData.list = list;
    } else {
      resData.state = false;
      resData.msg = 'Une erreur est survenue lors du traitement.';
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getListeExercice,
  createFirstExercice,
  createNextExercice,
  createPreviewExercice,
  verrouillerExercice,
  deverrouillerExercice,
  deleteExercice,
  getListeSituation,
  getListeExerciceById
};