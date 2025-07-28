const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const updateBalanceSold = require('../UpdateSolde/updateBalanceSold');
const UpdateEbilanBalanceRubrique = require('../UpdateSolde/updateEbilanBalanceRubrique');
const UpdateEbilanSoldeRubrique = require('../UpdateSolde/updateEbilanSoldeRubrique');
const UpdateEbilanSoldeTotalRubrique = require('../UpdateSolde/updateEbilanSoldeTotalRubrique');

const rubriques = db.rubriques;
const rubriquesmatrices = db.rubriquesmatrices;
const compterubriques = db.compterubriques;
const compterubriquematrices = db.compterubriquematrices;

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

const refreshBILAN = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{

    let stateRefresh = false;

    if(refreshTotal){
      await rubriques.destroy({
        where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          id_etat: 'BILAN'
        }
      });

      const matrixRubriqueListe = await rubriquesmatrices.findAll({
        where: 
        {
          id_etat: 'BILAN'
        }
      });

      if(matrixRubriqueListe.length > 0){
        for(let item of matrixRubriqueListe){
          await rubriques.create({
            id_compte: compteId,
            id_dossier : fileId,
            id_exercice: exerciceId,
            id_etat: item.id_etat,
            subtable: item.subtable,
            id_rubrique: item.id_rubrique,
            nature: item.nature,
            note: item.note,
            ordre: item.ordre,
            niveau: item.niveau,
          });
        }
      }

      await UpdateEbilanBalanceRubrique.balanceColumnBilan(compteId, fileId, exerciceId);
    }

    const updateSoldeBilan = await UpdateEbilanSoldeRubrique.soldeRubriqueBilan(compteId, fileId, exerciceId);
    const updateSoldeTotalBilan = await UpdateEbilanSoldeTotalRubrique.totalRubriqueBilan(compteId, fileId, exerciceId);

    if(updateSoldeBilan && updateSoldeTotalBilan){
      stateRefresh = true;
    }
    
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshCRN = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{
    let stateRefresh = false;

    if(refreshTotal){
      await rubriques.destroy({
        where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          id_etat: 'CRN'
        }
      });

      const matrixRubriqueListe = await rubriquesmatrices.findAll({
        where: 
        {
          id_etat: 'CRN'
        }
      });

      if(matrixRubriqueListe.length > 0){
        for(let item of matrixRubriqueListe){
          await rubriques.create({
            id_compte: compteId,
            id_dossier : fileId,
            id_exercice: exerciceId,
            id_etat: item.id_etat,
            subtable: item.subtable,
            id_rubrique: item.id_rubrique,
            nature: item.nature,
            note: item.note,
            ordre: item.ordre,
            niveau: item.niveau,
            senscalcul: item.senscalcul
          });
        }
      }

      await UpdateEbilanBalanceRubrique.balanceColumnCRN(compteId, fileId, exerciceId);
    }

    const updateSoldeCRN = await UpdateEbilanSoldeRubrique.soldeRubriqueCRN(compteId, fileId, exerciceId);
    const updateSoldeTotalCRN = await UpdateEbilanSoldeTotalRubrique.totalRubriqueCRN(compteId, fileId, exerciceId);

    if(updateSoldeCRN && updateSoldeTotalCRN){
      stateRefresh = true;
    }
    
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshCRF = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{
    let stateRefresh = false;

    if(refreshTotal){
      await rubriques.destroy({
        where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          id_etat: 'CRF'
        }
      });

      const matrixRubriqueListe = await rubriquesmatrices.findAll({
        where: 
        {
          id_etat: 'CRF'
        }
      });

      if(matrixRubriqueListe.length > 0){
        for(let item of matrixRubriqueListe){
          await rubriques.create({
            id_compte: compteId,
            id_dossier : fileId,
            id_exercice: exerciceId,
            id_etat: item.id_etat,
            subtable: item.subtable,
            id_rubrique: item.id_rubrique,
            nature: item.nature,
            note: item.note,
            ordre: item.ordre,
            niveau: item.niveau,
            senscalcul: item.senscalcul
          });
        }
      }

      await UpdateEbilanBalanceRubrique.balanceColumnCRF(compteId, fileId, exerciceId);
    }

    //await updateBalanceSold.updateSold(compteId, fileId, exerciceId, [], true);
    const updateSoldeCRF = await UpdateEbilanSoldeRubrique.soldeRubriqueCRF(compteId, fileId, exerciceId);
    const updateSoldeTotalCRF = await UpdateEbilanSoldeTotalRubrique.totalRubriqueCRF(compteId, fileId, exerciceId);

    if(updateSoldeCRF && updateSoldeTotalCRF){
      stateRefresh = true;
    }
    
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshTFTD = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{
    let stateRefresh = false;

    if(refreshTotal){
      await rubriques.destroy({
        where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          id_etat: 'TFTD'
        }
      });

      const matrixRubriqueListe = await rubriquesmatrices.findAll({
        where: 
        {
          id_etat: 'TFTD'
        }
      });

      if(matrixRubriqueListe.length > 0){
        for(let item of matrixRubriqueListe){
          await rubriques.create({
            id_compte: compteId,
            id_dossier : fileId,
            id_exercice: exerciceId,
            id_etat: item.id_etat,
            subtable: item.subtable,
            id_rubrique: item.id_rubrique,
            nature: item.nature,
            note: item.note,
            ordre: item.ordre,
            niveau: item.niveau,
            senscalcul: item.senscalcul
          });
        }
      }

      await UpdateEbilanBalanceRubrique.balanceColumnTFTD(compteId, fileId, exerciceId);
    }

    //const result = await updateBalanceSold.updateSold(compteId, fileId, exerciceId, [], true);
    const updateSoldeTFTD = await UpdateEbilanSoldeRubrique.soldeRubriqueTFTD(compteId, fileId, exerciceId);
    const updateSoldeTotalTFTD = await UpdateEbilanSoldeTotalRubrique.totalRubriqueTFTD(compteId, fileId, exerciceId);

    if(updateSoldeTFTD && updateSoldeTotalTFTD){
      stateRefresh = true;
    }
    
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshTFTI = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{
    let stateRefresh = false;

    if(refreshTotal){
      await rubriques.destroy({
        where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          id_etat: 'TFTI'
        }
      });

      const matrixRubriqueListe = await rubriquesmatrices.findAll({
        where: 
        {
          id_etat: 'TFTI'
        }
      });

      if(matrixRubriqueListe.length > 0){
        for(let item of matrixRubriqueListe){
          await rubriques.create({
            id_compte: compteId,
            id_dossier : fileId,
            id_exercice: exerciceId,
            id_etat: item.id_etat,
            subtable: item.subtable,
            id_rubrique: item.id_rubrique,
            nature: item.nature,
            note: item.note,
            ordre: item.ordre,
            niveau: item.niveau,
            senscalcul: item.senscalcul
          });
        }
      }

      await UpdateEbilanBalanceRubrique.balanceColumnTFTI(compteId, fileId, exerciceId);
    }

    //const result = await updateBalanceSold.updateSold(compteId, fileId, exerciceId, [], true);
    const updateSoldeTFTI = await UpdateEbilanSoldeRubrique.soldeRubriqueTFTI(compteId, fileId, exerciceId);
    const updateSoldeTotalTFTI = await UpdateEbilanSoldeTotalRubrique.totalRubriqueTFTI(compteId, fileId, exerciceId);

    if(updateSoldeTFTI && updateSoldeTotalTFTI){
      stateRefresh = true;
    }
    
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshEVCP = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{
    let stateRefresh = false;

    if(refreshTotal){
      await liasseevcps.destroy({
        where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          id_etat: 'EVCP'
        }
      });

      const matrixRubriqueListe = await rubriquesmatrices.findAll({
        where: 
        {
          id_etat: 'EVCP'
        }
      });

      if(matrixRubriqueListe.length > 0){
        for(let item of matrixRubriqueListe){
          await liasseevcps.create({
            id_compte: compteId,
            id_dossier : fileId,
            id_exercice: exerciceId,
            id_etat: item.id_etat,
            id_rubrique: item.id_rubrique,
            nature: item.nature,
            note: item.note,
            ordre: item.ordre,
            niveau: item.niveau
          });
        }
      }

      //await UpdateEbilanBalanceRubrique.balanceColumnEVCP(compteId, fileId, exerciceId);
    }

    //const result = await updateBalanceSold.updateSold(compteId, fileId, exerciceId, [], true);
    //const updateSoldeTFTI = await UpdateEbilanSoldeRubrique.soldeRubrique(compteId, fileId, exerciceId);
    const updateSoldeTotalEVCP = await UpdateEbilanSoldeTotalRubrique.totalRubriqueEVCP(compteId, fileId, exerciceId);

    if(updateSoldeTotalEVCP){
      stateRefresh = true;
    }
    
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshDRF = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{
    let stateRefresh = false;

    if(refreshTotal){
      await liassedrfs.destroy({
        where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          id_etat: 'DRF'
        }
      });

      const matrixRubriqueListe = await rubriquesmatrices.findAll({
        where: 
        {
          id_etat: 'DRF'
        }
      });

      if(matrixRubriqueListe.length > 0){
        for(let item of matrixRubriqueListe){
          await liassedrfs.create({
            id_compte: compteId,
            id_dossier : fileId,
            id_exercice: exerciceId,
            id_etat: item.id_etat,
            id_rubrique: item.id_rubrique,
            nature: item.nature,
            note: item.note,
            ordre: item.ordre,
            signe: item.senscalcul,
            niveau: item.niveau
          });
        }
      }

      //await UpdateEbilanBalanceRubrique.balanceColumnEVCP(compteId, fileId, exerciceId);
    }

    //const result = await updateBalanceSold.updateSold(compteId, fileId, exerciceId, [], true);
    const updateSoldeDRF = await UpdateEbilanSoldeRubrique.soldeRubriqueDRF(compteId, fileId, exerciceId);
    const updateSoldeTotalDRF = await UpdateEbilanSoldeTotalRubrique.totalRubriqueDRF(compteId, fileId, exerciceId);

    if(updateSoldeDRF && updateSoldeTotalDRF){
      stateRefresh = true;
    }
    
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshBHIAPC = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{
    // let stateRefresh = false;

    // if(refreshTotal){
    //   await liassebhiapcs.destroy({
    //     where: 
    //     {
    //       id_compte: compteId,
    //       id_dossier: fileId,
    //       id_exercice: exerciceId,
    //     }
    //   });

    //   //await UpdateEbilanBalanceRubrique.balanceColumnEVCP(compteId, fileId, exerciceId);
    // }

    // //const result = await updateBalanceSold.updateSold(compteId, fileId, exerciceId, [], true);
    // const updateSoldeDRF = await UpdateEbilanSoldeRubrique.soldeRubriqueDRF(compteId, fileId, exerciceId);
    // const updateSoldeTotalDRF = await UpdateEbilanSoldeTotalRubrique.totalRubriqueDRF(compteId, fileId, exerciceId);

    // if(updateSoldeDRF && updateSoldeTotalDRF){
    //   stateRefresh = true;
    // }
    
    // return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshDP = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{

    let stateRefresh = false;

    if(refreshTotal){
      await liassedps.destroy({
        where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          id_etat: 'DP',
          nature_prov:{[Op.notIn]: ['AUTRE']}, 
        }
      });

      const matrixRubriqueListe = await rubriquesmatrices.findAll({
        where: 
        {
          id_etat: 'DP'
        }
      });

      if(matrixRubriqueListe.length > 0){
        for(let item of matrixRubriqueListe){
          if(item.nature === 'RISQUE' || item.nature === 'DEPRECIATION'){
            await liassedps.create({
              id_compte: compteId,
              id_dossier : fileId,
              id_exercice: exerciceId,
              id_etat: item.id_etat,
              id_rubrique: item.id_rubrique,
              note: item.note,
              nature: item.nature,
              nature_prov: item.nature,
              libelle: item.libelle,
              ordre: item.ordre,
              niveau: item.niveau,
              signe: item.senscalcul
            });
          }
        }
      }
    }

    stateRefresh = true;
       
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshEIAFNC = async (compteId,fileId, exerciceId, matrix) => {
  try{

    let stateRefresh = false;

    if(matrix){
      stateRefresh = true;
    }
       
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshSAD = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{

    let stateRefresh = false;
  
    if(refreshTotal){
      await liassesads.destroy({
        where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          id_etat: 'SAD',
        }
      });

      const matrixRubriqueListe = await rubriquesmatrices.findAll({
        where: 
        {
          id_etat: 'SAD'
        }
      });

      if(matrixRubriqueListe.length > 0){
        for(let item of matrixRubriqueListe){
          await liassesads.create({
            id_compte: compteId,
            id_dossier : fileId,
            id_exercice: exerciceId,
            id_etat: item.id_etat,
            id_rubrique: item.id_rubrique,
            nature: item.nature,
            libelle: item.libelle,
            ordre: item.ordre,
            niveau: item.niveau,
          });
        }
      }
    }

    const updateSoldeSAD = await UpdateEbilanSoldeRubrique.soldeRubriqueSAD(compteId, fileId, exerciceId);
    const updateSoldeTotalSAD = await UpdateEbilanSoldeTotalRubrique.totalRubriqueSAD(compteId, fileId, exerciceId);

    if(updateSoldeSAD && updateSoldeTotalSAD){
      stateRefresh = true;
    }
     
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

const refreshSDR = async (compteId, fileId, exerciceId, refreshTotal) => {
  try{

    let stateRefresh = false;
  
    if(refreshTotal){
      await liassesdrs.destroy({
        where: 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId,
          id_etat: 'SDR',
        }
      });

      const matrixRubriqueListe = await rubriquesmatrices.findAll({
        where: 
        {
          id_etat: 'SDR'
        }
      });

      if(matrixRubriqueListe.length > 0){
        for(let item of matrixRubriqueListe){
          await liassesdrs.create({
            id_compte: compteId,
            id_dossier : fileId,
            id_exercice: exerciceId,
            id_etat: item.id_etat,
            id_rubrique: item.id_rubrique,
            nature: item.nature,
            libelle: item.libelle,
            ordre: item.ordre,
            niveau: item.niveau,
          });
        }
      }
    }

    const updateSoldeSDR = await UpdateEbilanSoldeRubrique.soldeRubriqueSDR(compteId, fileId, exerciceId);
    const updateSoldeTotalSDR = await UpdateEbilanSoldeTotalRubrique.totalRubriqueSDR(compteId, fileId, exerciceId);

    if(updateSoldeSDR && updateSoldeTotalSDR){
      stateRefresh = true;
    }
     
    return { stateRefresh };
  }catch (error){
    console.log(error);
  }
}

module.exports = {
  refreshBILAN,
  refreshCRN,
  refreshCRF,
  refreshTFTD,
  refreshTFTI,
  refreshEVCP,
  refreshDRF,
  refreshDP,
  refreshEIAFNC,
  refreshSAD,
  refreshSDR
};


