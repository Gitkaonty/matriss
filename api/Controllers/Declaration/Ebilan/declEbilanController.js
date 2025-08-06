const bcrypt = require("bcrypt");
const db = require("../../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const functionAddOrModifyRow = require('../../../Middlewares/Ebilan/declEbilanAddOrModifyFunction');
const declEbilanRefreshFunction = require('../../../Middlewares/Ebilan/declEbilanRefreshFunction');
const declEbilanDeleteFunction = require('../../../Middlewares/Ebilan/declEbilanDeleteFunction');
const recupTableau = require('../../../Middlewares/Ebilan/recupTableau');
const functionControles = require('../../../Middlewares/Ebilan/controles');

const compterubriques = db.compterubriques;
const etats = db.etats;
const ajustements = db.ajustements;
const controles = db.controles;

const infosVerrouillage = async (req, res) => {
  try{
    const {compteId, fileId, exerciceId} = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue lors du traitement.',
      liste: [],
    }

    const infosListe = await etats.findAll({
      where : 
        {
          id_compte: compteId,
          id_dossier: fileId,
          id_exercice: exerciceId
        }
    });

    if(infosListe){
      resData.state = true;
      resData.liste = infosListe;
      resData.msg = 'traitement terminé avec succès.';
    }

    return res.json(resData);
  }catch (error){
    console.log(error);
  }
}

const verrouillerTableau = async(req, res) => {
  try{
    const {compteId, fileId, exerciceId, tableau, verr} = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue lors du traitement.',
      liste: [],
    }

    const infosUpdate = await etats.update(
      {
        valide: verr
      },
      {
        where: 
          {
            id_compte: compteId,
            id_dossier: fileId,
            id_exercice: exerciceId,
            code: tableau,
          }
      }
    );

    if(infosUpdate){
      resData.state = true;
      resData.msg = 'traitement terminé avec succès.';
    }

    return res.json(resData);
  }catch (error){
    console.log(error);
  }
}

const getListeRubriqueGlobal = async (req, res) => {
  try {
    const { compteId, fileId, exerciceId } = req.body;

    let resData = {
      state: false,
      msg: '...',
      bilanActif: [],
      bilanPassif: [],
      crn: [],
      crf: [],
      tftd: [],
      tfti: [],
      evcp: [],
      drf: [],
      bhiapc: [],
      mp: [],
      da: [],
      dp: [],
      eiafnc: [],
      sad: [],
      sdr: [],
      se: [],
      ne: [],
      etatglobal: [],
      detailAnomBilan: [],
      detailAnomCrn: [],
      detailAnomCrf: [],
      detailAnomTfti: [],
      detailAnomTftd: [],
      detailAnomEvcp: [],
      detailAnomDrf: [],
      detailAnomBhiapc: [],
      detailAnomMp: [],
      detailAnomDa: [],
      detailAnomDp: [],
      detailAnomEiafnc: [],
      detailAnomSad: [],
      detailAnomSdr: [],
      detailAnomSe: [],
    }

      resData.bilanActif = await recupTableau.recupBILAN_ACTIF(compteId, fileId, exerciceId);
      resData.bilanPassif = await recupTableau.recupBILAN_PASSIF(compteId, fileId, exerciceId);
      resData.crn = await recupTableau.recupCRN(compteId, fileId, exerciceId);
      resData.crf = await recupTableau.recupCRF(compteId, fileId, exerciceId);
      resData.tftd= await recupTableau.recupTFTD(compteId, fileId, exerciceId);
      resData.tfti = await recupTableau.recupTFTI(compteId, fileId, exerciceId);
      resData.evcp = await recupTableau.recupEVCP(compteId, fileId, exerciceId);
      resData.drf = await recupTableau.recupDRF(compteId, fileId, exerciceId);
      resData.bhiapc = await recupTableau.recupBHIAPC(compteId, fileId, exerciceId);
      resData.mp = await recupTableau.recupMP(compteId, fileId, exerciceId);
      resData.da = await recupTableau.recupDA(compteId, fileId, exerciceId);
      resData.dp = await recupTableau.recupDP(compteId, fileId, exerciceId);
      resData.eiafnc = await recupTableau.recupEIAFNC(compteId, fileId, exerciceId);
      resData.sad = await recupTableau.recupSAD(compteId, fileId, exerciceId);
      resData.sdr = await recupTableau.recupSDR(compteId, fileId, exerciceId);
      resData.se = await recupTableau.recupSE(compteId, fileId, exerciceId);
      resData.ne = await recupTableau.recupNE(compteId, fileId, exerciceId);
      resData.bilanActif = await recupTableau.recupBILAN_ACTIF(compteId, fileId, exerciceId);
      resData.bilanPassif = await recupTableau.recupBILAN_PASSIF(compteId, fileId, exerciceId);
      resData.crn = await recupTableau.recupCRN(compteId, fileId, exerciceId);
      resData.crf = await recupTableau.recupCRF(compteId, fileId, exerciceId);
      resData.tftd= await recupTableau.recupTFTD(compteId, fileId, exerciceId);
      resData.tfti = await recupTableau.recupTFTI(compteId, fileId, exerciceId);
      resData.evcp = await recupTableau.recupEVCP(compteId, fileId, exerciceId);
      resData.drf = await recupTableau.recupDRF(compteId, fileId, exerciceId);
      resData.bhiapc = await recupTableau.recupBHIAPC(compteId, fileId, exerciceId);
      resData.mp = await recupTableau.recupMP(compteId, fileId, exerciceId);
      resData.da = await recupTableau.recupDA(compteId, fileId, exerciceId);
      resData.dp = await recupTableau.recupDP(compteId, fileId, exerciceId);
      resData.eiafnc = await recupTableau.recupEIAFNC(compteId, fileId, exerciceId);
      resData.sad = await recupTableau.recupSAD(compteId, fileId, exerciceId);
      resData.sdr = await recupTableau.recupSDR(compteId, fileId, exerciceId);
      resData.se = await recupTableau.recupSE(compteId, fileId, exerciceId);
      resData.ne = await recupTableau.recupNE(compteId, fileId, exerciceId);

      //récupération nombre anomalies et détails anomalies
      resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
      resData.detailAnomBilan = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'BILAN');
      resData.detailAnomCrn = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'CRN');
      resData.detailAnomCrf = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'CRF');
      resData.detailAnomTftd = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'TFTD');
      resData.detailAnomTfti = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'TFTI');
      resData.detailAnomEvcp = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'EVCP');
      resData.detailAnomDrf = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'DRF');
      resData.detailAnomBhiapc = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'BHIAPC');
      resData.detailAnomMp = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'MP');
      resData.detailAnomDa = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'DA');
      resData.detailAnomDp = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'DP');
      resData.detailAnomEiafnc = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'EIAFNC');
      resData.detailAnomSad = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'SAD');
      resData.detailAnomSdr = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'SDR');
      resData.detailAnomSe = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, 'SE');

    resData.state = true;
    return res.json(resData);
  }catch (error){
    console.log(error);
  }
}

const getListeOneTable = async (req, res) => {
  try{
    const {compteId, fileId, exerciceId, tableau} = req.body;

    let resData = {
      state: false,
      msg: '',
      list1: [],
      list2: [],
    }
    
    resData.list1 = await recupTableau.recupBILAN_ACTIF(compteId, fileId, exerciceId);
    resData.list2 = await recupTableau.recupBILAN_PASSIF(compteId, fileId, exerciceId);
  
    resData.state = true;
    res.status(200).json(resData);

  }catch (error){
    console.error('ERREUR getListeOneTable:', error);
    res.status(500).json({ state: false, error: error.message });
  }
    
}

  const getListeCompteRubrique = async (req, res)  => {
      try{
        let {compteId, fileId, exerciceId, tableau, choixPoste, rubriqueId} = req.body;

        compteId = Number(compteId);
        fileId = Number(fileId);
        exerciceId = Number(exerciceId);
  
        let resData = {
          state: false,
          msg: 'une erreur est survenue lors du traitement.',
          liste: []
          }
  
        if(rubriqueId){
          const liste= await compterubriques.findAll({
            where: {
              id_compte: compteId,
              id_dossier: fileId,
              id_exercice: exerciceId,
              id_etat: tableau,
              nature: choixPoste,
              id_rubrique: rubriqueId
            },
            raw:true,
            order: [['compte', 'ASC']]
          });
      
          if(liste){
            resData.state = true;
            resData.liste = liste;
          }else{
            resData.state = false;
            resData.msg = "Une erreur est survenue au moment du traitement des données";
          }
        }else{
          resData.state = true;
            resData.liste = [];
        }
        
        return res.json(resData);
      }catch (error){
        console.log(error);
      }
    }

    const activateCalcul = async (req, res) => {
      try{
        let {compteId, fileId, exerciceId, tableau, refreshTotal } = req.body;

        compteId = Number(compteId);
        fileId = Number(fileId);
        exerciceId = Number(exerciceId);
  
        let resData = {
          state: false,
          msg: 'une erreur est survenue lors du traitement.',
          list1: [],
          list2: [],
          etatglobal: [],
          detailAnom: []
        }

        if(tableau === 'BILAN'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshBILAN(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupBILAN_ACTIF(compteId, fileId, exerciceId);
            resData.list2 = await recupTableau.recupBILAN_PASSIF(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableau);

            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }
        }else if(tableau === 'CRN'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshCRN(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupCRN(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableau);

            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'CRF'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshCRF(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupCRF(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableau);

            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'TFTD'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshTFTD(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupTFTD(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableau);

            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'TFTI'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshTFTI(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupTFTI(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableau);

            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'EVCP'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshEVCP(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupEVCP(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableau);

            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'DRF'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshDRF(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupDRF(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableau);

            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'DP'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshDP(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupDP(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableau);

            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'SAD'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshSAD(compteId, fileId, exerciceId, refreshTotal);
          if(stateRefresh){
            resData.list1 = await recupTableau.recupSAD(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableau);

            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'SDR'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshSDR(compteId, fileId, exerciceId, refreshTotal);
          if(stateRefresh){
            resData.list1 = await recupTableau.recupSDR(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableau);

            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }
        
        return res.json(resData);
      }catch (error){
        console.log(error);
      }
    }

    const addmodifyTableau = async (req, res) => {
      try{
        const {compteId, fileId, exerciceId, tableau, formData } = req.body;
    
        let resData = {
          state: false,
          msg: 'une erreur est survenue lors du traitement.',
          liste: []
        }

        let tableSource = db;

        if(tableau === 'BHIAPC'){
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowBHIAPC(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
            resData.liste = await recupTableau.recupBHIAPC(compteId, fileId, exerciceId);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            resData.liste = await recupTableau.recupBHIAPC(compteId, fileId, exerciceId);
          }
        }else if(tableau === 'MP'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowMP(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
            resData.liste = await recupTableau.recupMP(compteId, fileId, exerciceId);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            resData.liste = await recupTableau.recupMP(compteId, fileId, exerciceId);
          }

        }else if(tableau === 'DA'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowDA(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
            resData.liste = await recupTableau.recupDA(compteId, fileId, exerciceId);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            resData.liste = await recupTableau.recupDA(compteId, fileId, exerciceId);
          }
        }else if(tableau === 'DP'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowDP(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
            resData.liste = await recupTableau.recupDP(compteId, fileId, exerciceId);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            resData.liste = await recupTableau.recupDP(compteId, fileId, exerciceId);
          }
        }else if(tableau === 'EIAFNC'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowEIAFNC(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
            resData.liste = await recupTableau.recupEIAFNC(compteId, fileId, exerciceId);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            resData.liste = await recupTableau.recupEIAFNC(compteId, fileId, exerciceId);
          }
        }else if(tableau === 'SAD'){
          tableSource = db.liassesads;
        }else if(tableau === 'SDR'){
          tableSource = db.liassesdrs;
        }else if(tableau === 'SE'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowSE(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
            resData.liste = await recupTableau.recupSE(compteId, fileId, exerciceId);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            resData.liste = await recupTableau.recupSE(compteId, fileId, exerciceId);
          }

        }else if(tableau === 'NE'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowNE(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
            resData.liste = await recupTableau.recupNE(compteId, fileId, exerciceId);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            resData.liste = await recupTableau.recupNE(compteId, fileId, exerciceId);
          }
        }

        return res.json(resData);
      }catch (error){
        console.log(error);
      }
    }

    const deleteTableOneRow = async (req, res) => {
      try{
        const {compteId, fileId, exerciceId, infoRowToDelete } = req.body;
    
        let resData = {
          state: false,
          msg: 'une erreur est survenue lors du traitement.',
          liste: [],
          etatglobal: [],
          detailAnom: []
        }

        let tableSource = db;

        if(infoRowToDelete.tableau === 'BHIAPC'){
          tableSource = db.liassebhiapcs;
        }else if(infoRowToDelete.tableau === 'MP'){
          tableSource = db.liassemps;
        }else if(infoRowToDelete.tableau === 'DA'){
          tableSource = db.liassedas;
        }else if(infoRowToDelete.tableau === 'DP'){
          tableSource = db.liassedps;
        }else if(infoRowToDelete.tableau === 'EIAFNC'){
          tableSource = db.liasseeiafncs;
        }else if(infoRowToDelete.tableau === 'SAD'){
          tableSource = db.liassesads;
        }else if(infoRowToDelete.tableau === 'SDR'){
          tableSource = db.liassesdrs;
        }else if(infoRowToDelete.tableau === 'SE'){
          tableSource = db.liasseses;
        }else if(infoRowToDelete.tableau === 'NE'){
          tableSource = db.liassenotes;
        }

        const deletedRow = await tableSource.destroy({
          where: 
            {
              id : infoRowToDelete.id,
              id_compte: compteId,
              id_dossier : fileId,
              id_exercice: exerciceId,
            }
        });

        if(deletedRow){
          if(infoRowToDelete.tableau === 'BHIAPC'){
            resData.liste = await recupTableau.recupBHIAPC(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', infoRowToDelete.tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, infoRowToDelete.tableau);

          }else if(infoRowToDelete.tableau === 'MP'){
            resData.liste = await recupTableau.recupMP(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', infoRowToDelete.tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, infoRowToDelete.tableau);

          }else if(infoRowToDelete.tableau === 'DA'){
            resData.liste = await recupTableau.recupDA(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', infoRowToDelete.tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, infoRowToDelete.tableau);

          }else if(infoRowToDelete.tableau === 'DP'){
            resData.liste = await recupTableau.recupDP(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', infoRowToDelete.tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, infoRowToDelete.tableau);

          }else if(infoRowToDelete.tableau === 'EIAFNC'){
            resData.liste = await recupTableau.recupEIAFNC(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', infoRowToDelete.tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, infoRowToDelete.tableau);

          }else if(infoRowToDelete.tableau === 'SAD'){
            
          }else if(infoRowToDelete.tableau === 'SDR'){
            
          }else if(infoRowToDelete.tableau === 'SE'){
            resData.liste = await recupTableau.recupSE(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', infoRowToDelete.tableau, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, infoRowToDelete.tableau);

          }else if(infoRowToDelete.tableau === 'NE'){
            resData.liste = await recupTableau.recupNE(compteId, fileId, exerciceId);
          }

          resData.state = true;
          resData.msg = "Suppression de la ligne effectuée avec succès.";
        }

        return res.json(resData);
      }catch (error){
        console.log(error);
      }
    }

    const deleteTableAllRow = async (req, res) => {
      try{
        const {compteId, fileId, exerciceId, tableauToDeleteAllRow } = req.body;

        let resData = {
          state: false,
          msg: 'une erreur est survenue lors du traitement.',
          liste: [],
          etatglobal: [],
          detailAnom: []
        }

        let tableSource = db;

        if(tableauToDeleteAllRow === 'BHIAPC'){
          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowBHIAPC(compteId, fileId, exerciceId);

          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
            resData.liste = await recupTableau.recupBHIAPC(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableauToDeleteAllRow, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableauToDeleteAllRow);
          }

        }else if(tableauToDeleteAllRow === 'MP'){
          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowMP(compteId, fileId, exerciceId);
          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
            resData.liste = await recupTableau.recupMP(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableauToDeleteAllRow, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableauToDeleteAllRow);
          }

        }else if(tableauToDeleteAllRow === 'DA'){
          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowDA(compteId, fileId, exerciceId);

          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
            resData.liste = await recupTableau.recupDA(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableauToDeleteAllRow, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableauToDeleteAllRow);
          }

        }else if(tableauToDeleteAllRow === 'DP'){

          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowDP(compteId, fileId, exerciceId);
          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
            resData.liste = await recupTableau.recupDP(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableauToDeleteAllRow, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableauToDeleteAllRow);
          }
         
        }else if(tableauToDeleteAllRow === 'EIAFNC'){
          
          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowEIAFNC(compteId, fileId, exerciceId);

          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
            resData.liste = await recupTableau.recupEIAFNC(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableauToDeleteAllRow, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableauToDeleteAllRow);
          }
        }else if(tableauToDeleteAllRow === 'EIAFNC'){
          
          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowEIAFNC(compteId, fileId, exerciceId);
          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
            resData.liste = await recupTableau.recupEIAFNC(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableauToDeleteAllRow, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableauToDeleteAllRow);
          }

        }else if(tableauToDeleteAllRow === 'SAD'){
          tableSource = db.liassesads;
        }else if(tableauToDeleteAllRow === 'SDR'){
          tableSource = db.liassesdrs;
        }else if(tableauToDeleteAllRow === 'SE'){
          
          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowSE(compteId, fileId, exerciceId);
          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
            resData.liste = await recupTableau.recupSE(compteId, fileId, exerciceId);

            const etatControl = await functionControles.controletableau('EBILAN', tableauToDeleteAllRow, compteId, fileId, exerciceId);
            resData.etatglobal = await recupTableau.recupETAT(compteId, fileId, exerciceId);
            resData.detailAnom = await recupTableau.recupETATDETAIL(compteId, fileId, exerciceId, tableauToDeleteAllRow);
          }

        }else if(tableauToDeleteAllRow === 'NE'){
          
          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowNE(compteId, fileId, exerciceId);
          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
            resData.liste = await recupTableau.recupNE(compteId, fileId, exerciceId);
          }
        }

        return res.json(resData);
      }catch (error){
        console.log(error);
      }
    }

    const listeAjustement = async (req, res) => {
      try{
        const { compteId, dossierId, exerciceId, etatId, rubriqueId, nature } = req.query;

        let resData = {
          state: false,
          msg: 'une erreur est survenue lors du traitement.',
          liste: [],
          etatglobal: [],
          detailAnom: []
        }
  
        const liste = await ajustements.findAll({
          where : 
            {
              id_compte: compteId,
              id_dossier: dossierId,
              id_exercice: exerciceId,
              id_etat: etatId,
              id_rubrique: rubriqueId,
              nature: nature
            }
        });
    
        if(liste){
          resData.state = true;
          resData.liste = liste;
          resData.msg = 'traitement terminé avec succès.';
        }
    
        return res.json(resData);
      }catch (error){
        console.log(error);
      }
    }

    const addModifyAjustement = async (req, res) => {
      try{
        const { id,
          state,
          id_compte,
          id_dossier,
          id_exercice,
          id_rubrique,
          id_etat,
          nature,
          motif,
          montant} = req.body;

        let resData = {
          state: false,
          msg: 'une erreur est survenue lors du traitement.',
          liste: [],
          etatglobal: [],
          detailAnom: []
        }
    
        const testIfExist = await ajustements.findAll({
          where: 
            {
              id: id,
              id_compte: id_compte,
              id_dossier: id_dossier,
              id_exercice: id_exercice,
              id_etat: id_etat,
              id_rubrique: id_rubrique,
              nature: nature
            }
        });
  
        if(testIfExist.length === 0){
          const addAjust = await ajustements.create({
            id_compte: id_compte,
            id_dossier: id_dossier,
            id_exercice: id_exercice,
            id_etat: id_etat,
            id_rubrique: id_rubrique,
            nature: nature,
            motif: motif,
            montant: montant
          });
  
          if(addAjust){
            resData.state = true;
            resData.msg = "Traitement effectué avec succès.";

            const etatControl = await functionControles.controletableau('EBILAN', id_etat, id_compte, id_dossier, id_exercice);
            resData.etatglobal = await recupTableau.recupETAT(id_compte, id_dossier, id_exercice);
            resData.detailAnom = await recupTableau.recupETATDETAIL(id_compte, id_dossier, id_exercice, id_etat);
          }else{
            resData.state = false;
            resData.msg = "Une erreur est survenue au moment du traitement des données";
          }
        }else{
          const ModifyAjust = await ajustements.update(
            {
              motif: motif,
              montant: montant
            },
            {
              where: 
                {
                  id: id,
                  id_compte: id_compte,
                  id_dossier: id_dossier,
                  id_exercice: id_exercice,
                  id_etat: id_etat,
                  id_rubrique: id_rubrique,
                  nature: nature
                }
            }
          );
  
          if(ModifyAjust){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";

            const etatControl = await functionControles.controletableau('EBILAN', id_etat, id_compte, id_dossier, id_exercice);
            resData.etatglobal = await recupTableau.recupETAT(id_compte, id_dossier, id_exercice);
            resData.detailAnom = await recupTableau.recupETATDETAIL(id_compte, id_dossier, id_exercice, id_etat);
          }else{
            resData.state = false;
            resData.msg = "Une erreur est survenue au moment du traitement des données";
          }
        }
    
        return res.json(resData);
      }catch (error){
        console.log(error);
      }
    }

    const deleteAjustement = async (req, res) => {
      try{
        const {idCompte, idDossier, idExercice, idEtat, idRubrique, nature, idToDelete } = req.body;

        let resData = {
          state: false,
          msg: 'une erreur est survenue lors du traitement.',
          liste: [],
        }

        const stateDeleting = await ajustements.destroy({
          where: 
          {
            id: idToDelete,
            id_compte: idCompte,
            id_dossier: idDossier,
            id_exercice: idExercice,
            id_etat: idEtat,
            id_rubrique: idRubrique,
            nature: nature
          }
        });

        if(stateDeleting){
          resData.state = true;
          resData.msg = "Suppression de la ligne effectuée avec succès.";

          const etatControl = await functionControles.controletableau('EBILAN', idEtat, idCompte, idDossier, idExercice);
          resData.etatglobal = await recupTableau.recupETAT(idCompte, idDossier, idExercice);
          resData.detailAnom = await recupTableau.recupETATDETAIL(idCompte, idDossier, idExercice, idEtat);
        }

        return res.json(resData);
      }catch (error){
        console.log(error);
      }
    }

    const savemodifAnom = async (req, res) => {
      try{
        const id = req.params.id;
        const {id_compte, id_dossier, id_exercice, valide, comments, etat_id } = req.body;

        let resData = {
          state: false,
          msg: 'une erreur est survenue lors du traitement.',
          liste: [],
        }

        if(await controles.update(
            {
              comments: comments,
              valide: valide
            },
            {
              where: 
                {
                  id: id,
                }
            }
          )){
            resData.liste = await recupTableau.recupETATDETAIL(id_compte, id_dossier, id_exercice, etat_id);
            resData.state = true;
            resData.msg = 'Sauvegardes des modifications terminés avec succès.'
          }

          return res.json(resData);
      }catch (error){
        console.log(error);
      }
    }

    module.exports = {
      infosVerrouillage,
      verrouillerTableau,
      getListeRubriqueGlobal,
      //getListeRubriqueIndividual,
      getListeOneTable,
      getListeCompteRubrique,
      activateCalcul,
      addmodifyTableau,
      deleteTableOneRow,
      deleteTableAllRow,
      addModifyAjustement,
      listeAjustement,
      deleteAjustement,
      savemodifAnom
    };
