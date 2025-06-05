const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const fonctionUpdateBalanceSold = require('../../Middlewares/UpdateSolde/updateBalanceSold');

const journals = db.journals;
const codejournals = db.codejournals;
const dossierPlanComptable = db.dossierplancomptable;

const createNotExistingCodeJournal = async (req, res)  => {
  try{
    const { compteId, fileId, codeJournalToCreate } = req.body; 

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    if(codeJournalToCreate.length > 0){
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
        raw:true,
      });

      resData.state = true;
      resData.list = updatedList;
    }else{
      //récuperer la liste à jour des codes journaux
    const updatedList = await codejournals.findAll({
      where: 
        {
          id_compte: compteId,
          id_dossier: fileId
        },
        raw:true,
      });

      resData.state = true;
      resData.list = updatedList;
    }

    return res.json(resData);
  }catch (error){
    console.log(error);
  }
}

const createNotExistingCompte = async (req, res)  => {
  try{
    const { compteId, fileId, compteToCreateGen, compteToCreateAux } = req.body; 

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    let validGen = false;
    let validAux = false;

    //création des comptes généraux
    if(compteToCreateGen.length > 0){
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
    }else{
      validAux = true;
    }

    //création des comptes auxiliaires
    if(compteToCreateAux.length > 0){

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
    }else{
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
        raw:true,
      });

    if(validAux && validGen){
      resData.state = true;
      resData.list = updatedList;
    }else{
      resData.state = false;
      resData.list = updatedList;
    }

    return res.json(resData);
  }catch (error){
    console.log(error);
  }
}

const importJournal = async (req, res)  => {
  try{
    const { compteId, userId, fileId, selectedPeriodeId, fileTypeCSV, valSelectCptDispatch, journalData } = req.body; 

    let resData = {
      state: false,
      msg: '',
      list: [],
      nbrligne: 0
    }

    let importSuccess = 1;

    if(valSelectCptDispatch === 'ECRASER'){
      journals.destroy({
        where: 
          {
            id_compte: compteId,
            id_dossier: fileId,
            id_exercice: selectedPeriodeId,
          }
      });
    }

    if(journalData.length > 0){
      for(let item of journalData){
        let codeJournalId = 0;
        const idCodeJournal =await codejournals.findOne({
          where: 
          {
            id_compte: compteId,
            id_dossier: fileId,
            code : item.JournalCode
          },
        });

        codeJournalId =idCodeJournal.id;

        let compteNumId = 0;
        let IdCompAuxNum = 0;
        const idCompte =await dossierPlanComptable.findOne({
          where: 
          {
            id_compte: compteId,
            id_dossier: fileId,
            compte : item.CompteNum
          },
        });

        if(idCompte){
          compteNumId = idCompte.id;
          IdCompAuxNum = idCompte.baseaux_id;
        }
        
        // if(item.CompAuxNum !== ""){
        //   const idCompteAux =await dossierPlanComptable.findOne({
        //     where: 
        //     {
        //       id_compte: compteId,
        //       id_dossier: fileId,
        //       compte : item.CompAuxNum
        //     },
        //   });
        //   IdCompAuxNum = idCompteAux.id;
        // }else{
        //   IdCompAuxNum = compteNumId;
        // }

        //date écriture
        let dateEcrit = null;
        if(item.EcritureDate !=='' && item.EcritureDate !== null){
          if(item.EcritureDate.includes("/")){
            const [day, month, year] = item.EcritureDate.split("/");
            dateEcrit = new Date(`${year}-${month}-${day}`);
          }else{
            let year = item.EcritureDate.substring(0, 4);
            let month = item.EcritureDate.substring(4, 6);
            let day = item.EcritureDate.substring(6, 8);

            dateEcrit = new Date(`${year}-${month}-${day}`);
          }
        }
        
        //date pièce
        let datePiece = null;
        if(item.PieceDate !=='' && item.PieceDate !== null){
          if(item.PieceDate.includes("/")){
            const [day1, month1, year1] = item.PieceDate.split("/");
            datePiece = new Date(`${year1}-${month1}-${day1}`);
          }else{
            let year1 = item.PieceDate.substring(0, 4);
            let month1 = item.PieceDate.substring(4, 6);
            let day1 = item.PieceDate.substring(6, 8);

            datePiece = new Date(`${year1}-${month1}-${day1}`);
          }
        }

        //date lettrage
        let datelettrage = null;
        if(item.DateLet !=='' && item.DateLet !== null){
          if(item.DateLet.includes("/")){
            const [day2, month2, year2] = item.DateLet.split("/");
            datelettrage = new Date(`${year2}-${month2}-${day2}`);
          }else{
            let year2 = item.DateLet.substring(0, 4);
            let month2 = item.DateLet.substring(4, 6);
            let day2 = item.DateLet.substring(6, 8);

            datelettrage = new Date(`${year2}-${month2}-${day2}`);
          }
        }

        //transformation de débit en double précision si c'est null ou vide
        let debit = 0;
        if(item.Debit !== null && item.Debit !==""){
          debit = item.Debit.replace(',','.')
        }

        let credit = 0;
        if(item.Credit !== null && item.Credit !==""){
          credit = item.Credit.replace(',','.')
        }

        //import du journal dans la table journal
        try{
          await journals.create({
            id_compte: compteId,
            id_dossier: fileId,
            id_exercice: selectedPeriodeId,
            id_ecriture: item.EcritureNum,
            dateecriture:dateEcrit,
            id_journal: codeJournalId,
            id_numcpt: compteNumId,
            id_numcptcentralise: IdCompAuxNum,
            piece: item.PieceRef,
            piecedate: datePiece,
            libelle: item.EcritureLib,
            debit: debit,
            credit: credit,
            devise: item.Idevise,
            lettrage: item.EcritureLet,
            lettragedate: datelettrage,
            saisiepar: userId,
          });

          importSuccess = importSuccess*1;
        }catch (error){
          importSuccess = importSuccess*0;
          resData.msg = error;
        }
      };
    }else{
      resData.msg = `${journalData.length} lignes ont été importées avec succès`;
      resData.nbrligne = journalData.length;
      resData.state = true;
    }

    if(importSuccess === 1){

      fonctionUpdateBalanceSold.updateSold(compteId, fileId, selectedPeriodeId, [], true);

      resData.msg = `${journalData.length} lignes ont été importées avec succès`;
      resData.nbrligne = journalData.length;
      resData.state = true;
    }else{
      resData.state = false;
    }
    
    return res.json(resData);
  }catch (error){
    console.log(error);
  }
}

module.exports = {
  createNotExistingCodeJournal,
  createNotExistingCompte,
  importJournal
};