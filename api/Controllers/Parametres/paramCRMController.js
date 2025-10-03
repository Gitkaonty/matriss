const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');

const dossiers = db.dossiers;
const dossierassocies = db.dossierassocies;
const dossierfiliales = db.dossierfiliales;
const dossierDomBank = db.dombancaires;
const pays = db.pays;

const getListePays = async (req, res) => {
  try {
    let resData = {
      state: false,
      msg: 'une erreur est survenue lors du traitement.',
      list: []
    }

    const list = await pays.findAll({});

    if (list) {
      resData.state = true;
      resData.list = list.map((pays) => pays.get({ plain: true }));
    } else {
      resData.state = false;
      resData.msg = 'une erreur est survenue lors du traitement.';
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const getInfosCRM = async (req, res) => {
  try {
    const fileId = req.params.id;

    let resData = {
      state: false,
      msg: 'une erreur est survenue lors du traitement.',
      list: []
    }

    const list = await dossiers.findOne({
      where: {
        id: fileId
      },
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

const modifyingInfos = async (req, res) => {
  try {
    let resData = {
      state: false,
      msg: '',
    }

    const {
      action,
      itemId,
      idCompte,
      idDossier,
      nomdossier,
      raisonsociale,
      denomination,
      nif,
      stat,
      rcs,
      responsable,
      expertcomptable,
      cac,
      forme,
      activite,
      detailsactivite,
      adresse,
      email,
      telephone,
      plancomptable,
      longueurcptstd,
      longueurcptaux,
      autocompletion,
      avecanalytique,
      tauxir,
      pourcentageca,
      montantmin,
      assujettitva,
      montantcapital,
      nbrpart,
      valeurpart,
      listeAssocies,
      listeFiliales,
      compteisi
    } = req.body;

    const modify = await dossiers.update(
      {
        id_compte: idCompte,
        dossier: nomdossier,
        nif: nif,
        stat: stat,
        responsable: responsable,
        expertcomptable: expertcomptable,
        cac: cac,
        raisonsociale: raisonsociale,
        denomination: denomination,
        formejuridique: forme,
        activite: activite,
        detailactivite: detailsactivite,
        adresse: adresse,
        email: email,
        telephone: telephone,
        longcomptestd: longueurcptstd,
        longcompteaux: longueurcptaux,
        autocompletion: autocompletion,
        avecanalytique: avecanalytique,
        tauxir: tauxir,
        pourcentageca: pourcentageca,
        montantmin: montantmin,
        assujettitva: assujettitva,
        capital: montantcapital || 0,
        nbrpart: nbrpart || 0,
        valeurpart: valeurpart || 0,
        id_plancomptable: plancomptable,
        rcs: rcs,
        compteisi: compteisi
      },
      {
        where: { id: idDossier }
      }
    );

    if (modify) {
      resData.state = true;
      resData.msg = 'Modification effectuée avec succès.';
    } else {
      resData.state = false;
      resData.msg = 'Une erreur est survenue lors de la création du nouveau dossier';
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const getListeAssocie = async (req, res) => {
  try {
    let resData = {
      state: false,
      liste: [],
      msg: '',
    }

    const fileId = req.params.id;
    const list = await dossierassocies.findAll({
      where: {
        id_dossier: fileId
      },
    });

    if (list) {
      resData.state = true;
      resData.liste = list
    } else {
      resData.state = false;
      resData.msg = 'Une erreur est survenue lors de la création du nouveau dossier';
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const getListeFiliale = async (req, res) => {
  try {
    let resData = {
      state: false,
      liste: [],
      msg: '',
    }

    const fileId = req.params.id;
    const list = await dossierfiliales.findAll({
      where: {
        id_dossier: fileId
      },
    });

    if (list) {
      resData.state = true;
      resData.liste = list
    } else {
      resData.state = false;
      resData.msg = 'Une erreur est survenue lors de la création du nouveau dossier';
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const getListeDomBank = async (req, res) => {
  try {
    let resData = {
      state: false,
      liste: [],
      msg: '',
    }

    const fileId = req.params.id;
    const list = await dossierDomBank.findAll({
      where: {
        id_dossier: fileId
      },
    });

    if (list) {
      resData.state = true;
      resData.liste = list
    } else {
      resData.state = false;
      resData.msg = 'Une erreur est survenue lors de la création du nouveau dossier';
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const associe = async (req, res) => {
  try {
    let resData = {
      state: false,
      msg: '',
    }

    const {
      idCompte,
      idDossier,
      idAssocie,
      type,
      nom,
      adresse,
      dateentree,
      datesortie,
      nombreparts,
      enactivite
    } = req.body;

    const testExist = await dossierassocies.findAll({
      where: { id: idAssocie }
    });

    if (testExist.length === 0) {
      const saveNewItem = await dossierassocies.create({
        id_dossier: idDossier,
        id_compte: idCompte,
        type: type,
        nom: nom,
        adresse: adresse,
        dateentree: dateentree,
        datesortie: datesortie,
        nbrpart: nombreparts,
        enactivite: enactivite
      });

      if (saveNewItem) {
        resData.state = true;
        resData.msg = 'Nouvel associé enregistré avec succès.';
      } else {
        resData.state = false;
        resData.msg = 'Une erreur est survenue lors du traitement des données.';
      }
    } else {
      const saveModif = await dossierassocies.update({
        id_dossier: idDossier,
        id_compte: idCompte,
        type: type,
        nom: nom,
        adresse: adresse,
        dateentree: dateentree,
        datesortie: datesortie,
        nbrpart: nombreparts,
        enactivite: enactivite
      },
        {
          where: { id: idAssocie }
        }
      );

      if (saveModif) {
        resData.state = true;
        resData.msg = 'Modifications enregistrées avec succès.';
      } else {
        resData.state = false;
        resData.msg = 'Une erreur est survenue lors du traitement des données.';
      }
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const filiale = async (req, res) => {
  try {
    let resData = {
      state: false,
      msg: '',
    }

    const {
      idCompte,
      idDossier,
      idFiliale,
      nom,
      dateentree,
      datesortie,
      nombreparts,
      enactivite
    } = req.body;

    const testExist = await dossierfiliales.findAll({
      where: { id: idFiliale }
    });

    if (testExist.length === 0) {
      const saveNewItem = await dossierfiliales.create({
        id_dossier: idDossier,
        id_compte: idCompte,
        nom: nom,
        dateentree: dateentree,
        datesortie: datesortie,
        nbrpart: nombreparts,
        enactivite: enactivite
      });

      if (saveNewItem) {
        resData.state = true;
        resData.msg = 'Nouvel associé enregistré avec succès.';
      } else {
        resData.state = false;
        resData.msg = 'Une erreur est survenue lors du traitement des données.';
      }
    } else {
      const saveModif = await dossierfiliales.update({
        id_dossier: idDossier,
        id_compte: idCompte,
        nom: nom,
        dateentree: dateentree,
        datesortie: datesortie,
        nbrpart: nombreparts,
        enactivite: enactivite
      },
        {
          where: { id: idFiliale }
        }
      );

      if (saveModif) {
        resData.state = true;
        resData.msg = 'Modifications enregistrées avec succès.';
      } else {
        resData.state = false;
        resData.msg = 'Une erreur est survenue lors du traitement des données.';
      }
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const domBank = async (req, res) => {
  try {
    let resData = {
      state: false,
      msg: '',
    }

    const {
      idCompte,
      idDossier,
      idDomBank,
      banque,
      numcompte,
      devise,
      pays,
      enactivite
    } = req.body;

    const testExist = await dossierDomBank.findAll({
      where: { id: idDomBank }
    });

    if (testExist.length === 0) {
      const saveNewItem = await dossierDomBank.create({
        id_dossier: idDossier,
        id_compte: idCompte,
        banque: banque,
        numcompte: numcompte,
        devise: devise,
        pays: pays,
        enactivite: enactivite
      });

      if (saveNewItem) {
        resData.state = true;
        resData.msg = 'Nouvelle domiciliation bancaire enregistrée avec succès.';
      } else {
        resData.state = false;
        resData.msg = 'Une erreur est survenue lors du traitement des données.';
      }
    } else {
      const saveModif = await dossierDomBank.update({
        id_dossier: idDossier,
        id_compte: idCompte,
        banque: banque,
        numcompte: numcompte,
        devise: devise,
        pays: pays,
        enactivite: enactivite
      },
        {
          where: { id: idDomBank }
        }
      );

      if (saveModif) {
        resData.state = true;
        resData.msg = 'Modifications enregistrées avec succès.';
      } else {
        resData.state = false;
        resData.msg = 'Une erreur est survenue lors du traitement des données.';
      }
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const deleteAssocie = async (req, res) => {
  try {
    const { fileId, compteId, idToDelete } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const deldAssocie = await dossierassocies.destroy({
      where: {
        id: idToDelete,
        id_dossier: fileId,
        id_compte: compteId
      }
    });

    if (deldAssocie) {
      resData.state = true;
      resData.msg = "Associé supprimé avec succès.";
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données.";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const deleteFiliale = async (req, res) => {
  try {
    const { fileId, compteId, idToDelete } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const deldFiliale = await dossierfiliales.destroy({
      where: {
        id: idToDelete,
        id_dossier: fileId,
        id_compte: compteId
      }
    });

    if (deldFiliale) {
      resData.state = true;
      resData.msg = "Filiale supprimée avec succès.";
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données.";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const deleteDomBank = async (req, res) => {
  try {
    const { fileId, compteId, idToDelete } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const deldDomBank = await dossierDomBank.destroy({
      where: {
        id: idToDelete,
        id_dossier: fileId,
        id_compte: compteId
      }
    });

    if (deldDomBank) {
      resData.state = true;
      resData.msg = "Suppression du domiciliation bancaire terminée avec succès.";
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
  getInfosCRM,
  modifyingInfos,
  getListeAssocie,
  getListeFiliale,
  getListeDomBank,
  associe,
  filiale,
  domBank,
  deleteAssocie,
  deleteFiliale,
  deleteDomBank,
  getListePays
};