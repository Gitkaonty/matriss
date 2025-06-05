const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const journals = db.journals;
const codejournals = db.codejournals;
const dossierPlanComptable = db.dossierplancomptable;
const balanceimportees = db.balanceimportees;

const createNotExistingCompte = async (req, res)  => {
  try{
    const { compteId, fileId, compteToCreate } = req.body; 

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    let valid = false;
    
    //création des comptes généraux
    if(compteToCreate.length > 0){
      await compteToCreate.map(item => {
        dossierPlanComptable.create({
          id_compte: compteId,
          id_dossier: fileId,
          compte: item.compte,
          libelle: item.libelle,
          nature: "General",
          typetier: "sans-nif",
        });
      })
      valid = true;
    }else{
      valid = true;
    }

    //récuperer la liste à jour des codes journaux
    const updatedList = await dossierPlanComptable.findAll({
      where: 
        {
          id_compte: compteId,
          id_dossier: fileId
        },
        raw:true,
      });

    if(valid){
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

const importBalance = async (req, res)  => {
  try{
    const { compteId, userId, fileId, selectedPeriodeId, balanceData } = req.body; 

    let resData = {
      state: false,
      msg: '',
      list: [],
      nbrligne: 0
    }

    let importSuccess = 1;

    await balanceimportees.destroy({
      where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: selectedPeriodeId,
        }
    });

    if(balanceData.length > 0){
      for(let item of balanceData){
        //transformation de débit en double précision si c'est null ou vide
        let mvtdebit = 0;
        if(item.mvtdebit !== null && item.mvtdebit !==""){
          mvtdebit = item.mvtdebit.replace(',','.')
        }

        let mvtcredit = 0;
        if(item.mvtcredit !== null && item.mvtcredit !==""){
          mvtcredit = item.mvtcredit.replace(',','.')
        }

        let soldedebit = 0;
        if(item.soldedebit !== null && item.soldedebit !==""){
          soldedebit = item.soldedebit.replace(',','.')
        }

        let soldecredit = 0;
        if(item.soldecredit !== null && item.soldecredit !==""){
          soldecredit = item.soldecredit.replace(',','.')
        }

        //import du journal dans la table journal
        try{
          await balanceimportees.create({
            id_compte: compteId,
            id_dossier: fileId,
            id_exercice: selectedPeriodeId,
            compte: item.compte,
            libelle: item.libelle,
            mvtdebit: mvtdebit,
            mvtcredit: mvtcredit,
            soldedebit: soldedebit,
            soldecredit: soldecredit,
          });

          importSuccess = importSuccess*1;
        }catch (error){
          importSuccess = importSuccess*0;
          resData.msg = error;
        }
      };
    }else{
      resData.msg = `${balanceData.length} lignes ont été importées avec succès`;
      resData.nbrligne = balanceData.length;
      resData.state = true;
    }

    if(importSuccess === 1){
      resData.msg = `${balanceData.length} lignes ont été importées avec succès`;
      resData.nbrligne = balanceData.length;
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
  createNotExistingCompte,
  importBalance
};