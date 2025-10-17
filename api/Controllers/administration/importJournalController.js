const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const fonctionUpdateBalanceSold = require('../../Middlewares/UpdateSolde/updateBalanceSold');

const journals = db.journals;
const codejournals = db.codejournals;
const dossierPlanComptable = db.dossierplancomptable;

const createNotExistingCodeJournal = async (req, res) => {
  try {
    const { compteId, fileId, codeJournalToCreate } = req.body;

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    if (codeJournalToCreate.length > 0) {
      await codeJournalToCreate.map(item => {
        codejournals.create({
          id_compte: compteId,
          id_dossier: fileId,
          code: item,
          libelle: 'Libellé et type à définir',
          type: 'OD',
        });
      })

      //récuperer la liste à jour des codes journaux
      const updatedList = await codejournals.findAll({
        where:
        {
          id_compte: compteId,
          id_dossier: fileId
        },
        raw: true,
      });

      resData.state = true;
      resData.list = updatedList;
    } else {
      //récuperer la liste à jour des codes journaux
      const updatedList = await codejournals.findAll({
        where:
        {
          id_compte: compteId,
          id_dossier: fileId
        },
        raw: true,
      });

      resData.state = true;
      resData.list = updatedList;
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const createNotExistingCompte = async (req, res) => {
  try {
    const { compteId, fileId, compteToCreateGen, compteToCreateAux } = req.body;

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    let validGen = false;
    let validAux = false;

    //création des comptes généraux
    if (compteToCreateGen.length > 0) {
      await compteToCreateGen.map(item => {
        dossierPlanComptable.create({
          id_compte: compteId,
          id_dossier: fileId,
          compte: item.CompteNum,
          libelle: item.CompteLib,
          nature: "General",
          typetier: "general",
          baseaux: item.CompteNum,
          pays: 'Madagascar'
        });
      })
      validGen = true;
    } else {
      validAux = true;
    }

    //création des comptes auxiliaires
    if (compteToCreateAux.length > 0) {

      const baseauxID = dossierPlanComptable.findOne({
        where:
        {
          id_compte: compteId,
          id_dossier: fileId,
          compte: item.CompteNum
        }
      });

      await compteToCreateAux.map(item => {
        dossierPlanComptable.create({
          id_compte: compteId,
          id_dossier: fileId,
          compte: item.CompAuxNum,
          libelle: item.CompAuxLib,
          nature: "Aux",
          typetier: "sans-nif",
          pays: 'Madagascar',
          baseaux: baseauxID.id || 0
        });
      })
      validAux = true;
    } else {
      validAux = true;
    }

    await db.sequelize.query(`
      UPDATE dossierPlanComptables SET
      baseaux_id = id
      WHERE compte = baseaux AND id_compte = :compteId AND id_dossier = :fileId
    `,
      {
        replacements: { compteId, fileId },
        type: db.Sequelize.QueryTypes.UPDATE
      }
    );

    //récuperer la liste à jour des codes journaux
    const updatedList = await dossierPlanComptable.findAll({
      where:
      {
        id_compte: compteId,
        id_dossier: fileId
      },
      raw: true,
    });

    if (validAux && validGen) {
      resData.state = true;
      resData.list = updatedList;
    } else {
      resData.state = false;
      resData.list = updatedList;
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

function parseDate(str) {
  if (!str) return null;
  if (str.includes("/")) {
    const [day, month, year] = str.split("/");
    return new Date(`${year}-${month}-${day}`);
  } else {
    return new Date(`${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`);
  }
}

const importJournal = async (req, res) => {
  try {
    const { compteId, userId, fileId, selectedPeriodeId, fileTypeCSV, valSelectCptDispatch, journalData } = req.body;
    // return res.json({ state: true, msg: 'OK' });

    let resData = {
      state: false,
      msg: '',
      list: [],
      nbrligne: 0
    }

    let importSuccess = 1;

    if (valSelectCptDispatch === 'ECRASER') {
      journals.destroy({
        where:
        {
          id_compte: Number(compteId),
          id_dossier: Number(fileId),
          id_exercice: Number(selectedPeriodeId),
        }
      });
    }

    if (journalData.length > 0) {
      let importSuccess = 1;

      // Grouper une seule fois
      const grouped = journalData.reduce((acc, item) => {
        if (!acc[item.EcritureNum]) acc[item.EcritureNum] = [];
        acc[item.EcritureNum].push(item);
        return acc;
      }, {});

      // Pour chaque groupe
      for (let ecritureNum in grouped) {
        const lines = grouped[ecritureNum];
        const newIdEcriture = Date.now(); // ou uuid si besoin

        // Traiter chaque ligne du groupe
        for (let item of lines) {
          try {
            // Récupération des IDs
            const idCodeJournal = await codejournals.findOne({
              where: { id_compte: compteId, id_dossier: fileId, code: item.JournalCode },
            });
            const codeJournalId = idCodeJournal?.id || 0;

            const idCompte = await dossierPlanComptable.findOne({
              where: { id_compte: compteId, id_dossier: fileId, compte: item.CompteNum },
            });
            const compteNumId = idCompte?.id || 0;
            const IdCompAuxNum = idCompte?.baseaux_id || compteNumId;

            // Dates
            const dateEcrit = parseDate(item.EcritureDate);
            const datePiece = parseDate(item.PieceDate);
            const datelettrage = parseDate(item.DateLet);

            // Montants
            const debit = item.Debit ? parseFloat(item.Debit.replace(',', '.')) : 0;
            const credit = item.Credit ? parseFloat(item.Credit.replace(',', '.')) : 0;

            // Création journal
            await journals.create({
              id_compte: compteId,
              id_dossier: fileId,
              id_exercice: selectedPeriodeId,
              id_ecriture: newIdEcriture,
              dateecriture: dateEcrit,
              id_journal: codeJournalId,
              id_numcpt: compteNumId,
              id_numcptcentralise: IdCompAuxNum,
              piece: item.PieceRef,
              piecedate: datePiece,
              libelle: item.EcritureLib,
              debit,
              credit,
              devise: item.Idevise || 'MGA',
              lettrage: item.EcritureLet || null,
              lettragedate: datelettrage || null,
              saisiepar: userId,
              modifierpar: userId || 0,
            });

            importSuccess = importSuccess * 1;
          } catch (error) {
            importSuccess = importSuccess * 0;
            resData.msg = error;
          }
        }
      }
    } else {
      resData.msg = `${journalData.length} lignes ont été importées avec succès`;
      resData.nbrligne = journalData.length;
      resData.state = true;
    }

    if (importSuccess === 1) {

      fonctionUpdateBalanceSold.updateSold(compteId, fileId, selectedPeriodeId, [], true);

      resData.msg = `${journalData.length} lignes ont été importées avec succès`;
      resData.nbrligne = journalData.length;
      resData.state = true;
    } else {
      resData.state = false;
    }

    return res.json(resData);
  } catch (error) {
    importSuccess = importSuccess * 0;
    resData.msg = error.message || JSON.stringify(error);
  }
}

module.exports = {
  createNotExistingCodeJournal,
  createNotExistingCompte,
  importJournal
};