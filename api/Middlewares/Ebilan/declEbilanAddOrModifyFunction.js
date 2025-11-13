const db = require("../../Models");
require('dotenv').config();

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

const addOrmodifyRowBHIAPC = async (compteId, fileId, exerciceId, formData) => {
  try {

    let stateModify = false;
    let stateAdd = false;

    const testIfExist = await liassebhiapcs.findAll({
      where:
      {
        id: formData.id
      }
    });

    if (testIfExist.length > 0) {
      const ModifyParam = await liassebhiapcs.update(
        {
          // id_compte: compteId,
          // id_dossier: fileId,
          // id_exercice: exerciceId,
          nif: formData.nif,
          raison_sociale: formData.raisonsociale,
          adresse: formData.adresse,
          // montant_charge: formData.montantcharge,
          // montant_beneficiaire: formData.montantbeneficiaire,
          // id_etat: 'BHIAPC',
          // anomalie: !formData.nif || !formData.libelle || !formData.adresse
        },
        {
          where: { nif: formData.nif, id_dossier: fileId, id_compte: compteId, id_exercice: exerciceId }
        }
      );

      if (ModifyParam) {
        stateModify = true;
      }
    } else {
      const createNewRow = await liassebhiapcs.create({
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
        nif: formData.nif,
        raison_sociale: formData.raisonsociale,
        adresse: formData.adresse,
        montant_charge: formData.montantcharge,
        montant_beneficiaire: formData.montantbeneficiaire,
        id_etat: 'BHIAPC',
        // anomalie: !formData.nif || !formData.libelle || !formData.adresse
      });

      if (createNewRow) {
        stateAdd = true;
      }
    }

    return { stateModify, stateAdd };
  } catch (error) {
    console.log(error);
  }
}

const isValidDate = (date) => {
  const d = new Date(date);
  return d.getTime() === d.getTime(); // Vérifie si la date est valide
};

const addOrmodifyRowMP = async (compteId, fileId, exerciceId, formData) => {
  try {

    let stateModify = false;
    let stateAdd = false;

    const testIfExist = await liassemps.findAll({
      where:
      {
        id: formData.id
      }
    });

    if (testIfExist.length > 0) {
      const ModifyParam = await liassemps.update(
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          marche: formData.marche,
          ref_marche: formData.ref_marche,
          date: isValidDate(formData.date) ? formData.date : null,
          date_paiement: isValidDate(formData.datepaiement) ? formData.datepaiement : null,
          montant_marche_ht: formData.montantht,
          montant_paye: formData.montantpaye,
          tmp: formData.montanttmp,
          // id_etat: 'MP'
        },
        {
          where: { id: formData.id }
        }
      );

      if (ModifyParam) {
        stateModify = true;
      }
    } else {
      const createNewRow = await liassemps.create({
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
        marche: formData.marche,
        ref_marche: formData.refmarche,
        date: isValidDate(formData.date) ? formData.date : null,
        date_paiement: isValidDate(formData.datepaiement) ? formData.datepaiement : null,
        montant_marche_ht: formData.montantht,
        montant_paye: formData.montantpaye,
        tmp: formData.montanttmp,
        id_etat: 'MP'
      });

      if (createNewRow) {
        stateAdd = true;
      }
    }

    return { stateModify, stateAdd };
  } catch (error) {
    console.log(error);
  }
}

const addOrmodifyRowDA = async (compteId, fileId, exerciceId, formData) => {
  try {

    let stateModify = false;
    let stateAdd = false;

    const testIfExist = await liassedas.findAll({
      where:
      {
        id: formData.id
      }
    });

    if (testIfExist.length > 0) {
      const ModifyParam = await liassedas.update(
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          rubriques_poste: formData.rubriques_poste,
          libelle: formData.libelle,
          num_compte: formData.num_compte,
          date_acquisition: isValidDate(formData.date_acquisition) ? formData.date_acquisition : null,
          taux: formData.taux,
          valeur_acquisition: formData.valeur_acquisition,
          augmentation: formData.augmentation,
          diminution: formData.diminution,
          amort_anterieur: formData.amort_anterieur,
          dotation_exercice: formData.dotation_exercice,
          amort_cumule: formData.amort_cumule,
          valeur_nette: formData.valeur_nette,
          // id_etat: 'MANUEL'
        },
        {
          where: { id: formData.id }
        }
      );

      if (ModifyParam) {
        stateModify = true;
      }
    } else {
      const createNewRow = await liassedas.create({
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
        rubriques_poste: formData.rubriques_poste,
        libelle: formData.libelle,
        num_compte: formData.num_compte,
        date_acquisition: isValidDate(formData.date_acquisition) ? formData.date_acquisition : null,
        taux: formData.taux,
        valeur_acquisition: formData.valeur_acquisition,
        augmentation: formData.augmentation,
        diminution: formData.diminution,
        amort_anterieur: formData.amort_anterieur,
        dotation_exercice: formData.dotation_exercice,
        amort_cumule: formData.amort_cumule,
        valeur_nette: formData.valeur_nette,
        id_etat: 'DA'
      });

      if (createNewRow) {
        stateAdd = true;
      }
    }

    return { stateModify, stateAdd };
  } catch (error) {
    console.log(error);
  }
}

const addOrmodifyRowDP = async (compteId, fileId, exerciceId, formData) => {
  try {

    let stateModify = false;
    let stateAdd = false;

    const testIfExist = await liassedps.findAll({
      where:
      {
        id: formData.id
      }
    });

    if (testIfExist.length > 0) {
      const ModifyParam = await liassedps.update(
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          nature_prov: formData.nature_prov,
          libelle: formData.libelle,
          type_calcul: formData.type_calcul,
          montant_debut_ex: formData.montant_debut_ex,
          augm_dot_ex: formData.augm_dot_ex,
          dim_repr_ex: formData.dim_repr_ex,
          montant_fin: formData.montant_fin,
          //id_etat: 'DP'
        },
        {
          where: { id: formData.id }
        }
      );

      if (ModifyParam) {
        stateModify = true;
      }
    } else {
      const createNewRow = await liassedps.create({
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
        nature_prov: formData.nature_prov,
        libelle: formData.libelle,
        type_calcul: formData.type_calcul,
        montant_debut_ex: formData.montant_debut_ex,
        augm_dot_ex: formData.augm_dot_ex,
        dim_repr_ex: formData.dim_repr_ex,
        montant_fin: formData.montant_fin,
        id_etat: 'DP'
      });

      if (createNewRow) {
        stateAdd = true;
      }
    }

    return { stateModify, stateAdd };
  } catch (error) {
    console.log(error);
  }
}

const addOrmodifyRowEIAFNC = async (compteId, fileId, exerciceId, formData) => {
  try {

    let stateModify = false;
    let stateAdd = false;

    const testIfExist = await liasseeiafncs.findAll({
      where:
      {
        id: formData.id
      }
    });

    if (testIfExist.length > 0) {
      const ModifyParam = await liasseeiafncs.update(
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          rubriques_poste: formData.rubriques_poste,
          num_compte: formData.num_compte,
          libelle: formData.libelle,
          valeur_acquisition: formData.valeur_acquisition,
          augmentation: formData.augmentation,
          diminution: formData.diminution,
          valeur_brute: formData.valeur_brute,
        },
        {
          where: { id: formData.id }
        }
      );

      if (ModifyParam) {
        stateModify = true;
      }
    } else {
      const createNewRow = await liasseeiafncs.create({
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
        rubriques_poste: formData.rubriques_poste,
        num_compte: formData.num_compte,
        libelle: formData.libelle,
        valeur_acquisition: formData.valeur_acquisition,
        augmentation: formData.augmentation,
        diminution: formData.diminution,
        valeur_brute: formData.valeur_brute,
        id_etat: 'EIAFNC'
      });

      if (createNewRow) {
        stateAdd = true;
      }
    }

    return { stateModify, stateAdd };
  } catch (error) {
    console.log(error);
  }
}

const addOrmodifyRowSE = async (compteId, fileId, exerciceId, formData) => {
  try {

    let stateModify = false;
    let stateAdd = false;

    const testIfExist = await liasseses.findAll({
      where:
      {
        id: formData.id
      }
    });

    if (testIfExist.length > 0) {
      const ModifyParam = await liasseses.update(
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          liste_emprunteur: formData.liste_emprunteur,
          date_contrat: isValidDate(formData.date_contrat) ? formData.date_contrat : null,
          duree_contrat: formData.duree_contrat,
          montant_emprunt: formData.montant_emprunt,
          montant_interet: formData.montant_interet,
          montant_total: formData.montant_total,
          date_disposition: isValidDate(formData.date_disposition) ? formData.date_disposition : null,
          montant_rembourse_capital: formData.montant_rembourse_capital,
          montant_rembourse_interet: formData.montant_rembourse_interet,
          solde_non_rembourse: formData.solde_non_rembourse,
          date_remboursement: isValidDate(formData.date_remboursement) ? formData.date_remboursement : null,
        },
        {
          where: { id: formData.id }
        }
      );

      if (ModifyParam) {
        stateModify = true;
      }
    } else {
      const createNewRow = await liasseses.create({
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
        liste_emprunteur: formData.liste_emprunteur,
        date_contrat: isValidDate(formData.date_contrat) ? formData.date_contrat : null,
        duree_contrat: formData.duree_contrat,
        montant_emprunt: formData.montant_emprunt,
        montant_interet: formData.montant_interet,
        montant_total: formData.montant_total,
        date_disposition: isValidDate(formData.date_disposition) ? formData.date_disposition : null,
        montant_rembourse_capital: formData.montant_rembourse_capital,
        montant_rembourse_interet: formData.montant_rembourse_interet,
        solde_non_rembourse: formData.solde_non_rembourse,
        date_remboursement: isValidDate(formData.date_remboursement) ? formData.date_remboursement : null,
        id_etat: 'SE'
      });

      if (createNewRow) {
        stateAdd = true;
      }
    }

    return { stateModify, stateAdd };
  } catch (error) {
    console.log(error);
  }
}

const addOrmodifyRowNE = async (compteId, fileId, exerciceId, formData) => {
  try {

    let stateModify = false;
    let stateAdd = false;

    const testIfExist = await liassenotes.findAll({
      where:
      {
        id: formData.id
      }
    });

    if (testIfExist.length > 0) {
      const ModifyParam = await liassenotes.update(
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          tableau: formData.tableau,
          ref_note: formData.ref_note,
          commentaires: formData.commentaires,
        },
        {
          where: { id: formData.id }
        }
      );

      if (ModifyParam) {
        stateModify = true;
      }
    } else {
      const createNewRow = await liassenotes.create({
        id_compte: compteId,
        id_dossier: fileId,
        id_exercice: exerciceId,
        id_etat: 'NE',
        tableau: formData.tableau,
        ref_note: formData.ref_note,
        commentaires: formData.commentaires,
      });

      if (createNewRow) {
        stateAdd = true;
      }
    }

    return { stateModify, stateAdd };
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  addOrmodifyRowBHIAPC,
  addOrmodifyRowMP,
  addOrmodifyRowDA,
  addOrmodifyRowDP,
  addOrmodifyRowEIAFNC,
  addOrmodifyRowSE,
  addOrmodifyRowNE
};


