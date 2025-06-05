const bcrypt = require("bcrypt");
const db = require("../../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const functionAddOrModifyRow = require('../../../Middlewares/Ebilan/declEbilanAddOrModifyFunction');
const declEbilanRefreshFunction = require('../../../Middlewares/Ebilan/declEbilanRefreshFunction');
const declEbilanDeleteFunction = require('../../../Middlewares/Ebilan/declEbilanDeleteFunction');
const recupTableau = require('../../../Middlewares/Ebilan/recupTableau');

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
const etats = db.etats;
const balances = db.balances;
const dossierplancomptables = db.dossierplancomptable;
const ajustements = db.ajustements;

// rubriques.belongsTo(rubriquesmatrices, { as: 'rubriquematrix', foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// rubriques.hasMany(balances, {as: 'details', foreignKey: 'rubriquebilanbrut', sourceKey: 'id_rubrique'});
// rubriques.hasMany(ajustements, {as: 'ajusts',foreignKey: 'id_rubrique', sourceKey: 'id_rubrique'});

// balances.belongsTo(dossierplancomptables, {as: 'infosCompte', foreignKey: 'id_numcompte', targetKey: 'id'});
//rubriquesmatrices.hasMany(rubriques, { foreignKey: 'id_rubrique' });
// liassebhiapcs.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liassedas.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liassedps.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liassedrfs.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liasseeiafncs.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liasseevcps.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liassempautres.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liassemps.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liassenotes.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liassesads.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liassesdrs.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
// liasseses.belongsTo(rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});

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

// const getTableau = async (compteId, fileId, exerciceId, tableau, subtable) => {
  
//   try {
//     const listeBrute = await rubriques.findAll({
//       where: {
//         id_compte: compteId,
//         id_dossier: fileId,
//         id_exercice: exerciceId,
//         id_etat: tableau,
//         subtable: subtable,
//       },
//       include: [
//         {
//           model: rubriquesmatrices,
//           attributes: [['libelle', 'libelle']],
//           required: false,
//           where: {
//             id_etat: tableau,
//           },
//         },
//         {
//           model: balances,
//           as: 'details',
//           attributes: [
//             ['id_numcompte', 'id_numcompte'],
//             ['soldedebit', 'soldedebit'],
//             ['soldecredit', 'soldecredit']
//           ],
//           required: false,
//           where: {
//             id_compte: compteId,
//             id_dossier: fileId,
//             id_exercice: exerciceId,
//           },
//           include: [
//             {
//               model: dossierplancomptables,
//               as: 'infosCompte', // doit correspondre à l'alias de la relation
//               attributes: ['compte', 'libelle'],
//               required: false,
//               where: {
//                 id_compte: compteId,
//                 id_dossier: fileId,
//               },
//             }
//           ]
//         },
//         {
//           model: ajustements,
//           as: 'ajusts',
//           attributes: ['id', 'id_compte', 'id_dossier', 'id_exercice', 'id_etat', 'id_rubrique', 'nature', 'motif', 'montant'],
//           required: false,
//           where: {
//             id_compte: compteId,
//             id_dossier: fileId,
//             id_exercice: exerciceId,
//             id_etat: tableau,
//           },
//         },
//       ],
//       raw: false,
//       order: [['ordre', 'ASC']],
//     });

//     const liste = listeBrute.map(rubrique => {
//       const plain = rubrique.get({ plain: true });
    
//       return {
//         ...plain,
//         'rubriquesmatrix.libelle': plain.rubriquesmatrix?.libelle || '',
//         infosCompte: (plain.details || []).map(detail => ({
//           id_numcompte: detail.id_numcompte,  // Prendre l'id_numcompte ici
//           compte: detail.infosCompte?.compte || null,
//           libelle: detail.infosCompte?.libelle || null,
//           soldedebit: detail.soldedebit || 0,
//           soldecredit: detail.soldecredit || 0
//         }))
//       };
//     });

//     return liste ;

//   } catch (error) {
//     console.error("Erreur dans getTableau :", error);
//     return [];
//   }
// }

// const getAutreTableau = async (compteId, fileId, exerciceId, tableau) => {
//   let tableSource = db;

//   if(tableau === 'EVCP'){
//     tableSource = db.liasseevcps;
//   }else if(tableau === 'DRF'){
//     tableSource = db.liassedrfs;
//   }else if(tableau === 'BHIAPC'){
//     tableSource = db.liassebhiapcs;
//   }else if(tableau === 'MP'){
//     tableSource = db.liassemps;
//   }else if(tableau === 'DA'){
//     tableSource = db.liassedas;
//   }else if(tableau === 'DP'){
//     tableSource = db.liassedps;
//   }else if(tableau === 'EIAFNC'){
//     tableSource = db.liasseeiafncs;
//   }else if(tableau === 'SAD'){
//     tableSource = db.liassesads;
//   }else if(tableau === 'SDR'){
//     tableSource = db.liassesdrs;
//   }else if(tableau === 'SE'){
//     tableSource = db.liasseses;
//   }else if(tableau === 'NE'){
//     tableSource = db.liassenotes;
//   }

//   const liste = await tableSource.findAll({
//     where: {
//       id_compte: compteId,
//       id_dossier: fileId,
//       id_exercice: exerciceId,
//       id_etat: {[Op.in]: ['MANUEL',tableau]},
//       //nature:{[Op.notIn]: ['TOTAL','TITRE']}, 
//     },
//     include: [
//       { model: rubriquesmatrices, 
//         attributes: [
//           ['libelle', 'libelle']
//         ],
//         required: false,
//         where: {
//           //id_rubrique: Sequelize.col('rubriques.id_rubrique'),
//           id_etat: tableau,
//           //nature:{[Op.notIn]: ['TOTAL','TITRE']}, 
//         }
//       },
//     ],
//     raw:true,
//     order: [['ordre', 'ASC']]
//   });

//   return liste;
// }

const getListeRubriqueGlobal = async (req, res)  => {
  try{
    const {compteId, fileId, exerciceId} = req.body;

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
    }

      resData.bilanActif = await recupTableau.recupBILAN_ACTIF(compteId, fileId, exerciceId);
      resData.bilanPassif = await recupTableau.recupBILAN_PASSIF(compteId, fileId, exerciceId);
      resData.crn = await recupTableau.recupCRN(compteId, fileId, exerciceId);
      resData.crf = await recupTableau.recupCRF(compteId, fileId, exerciceId);
      resData.tftd= await recupTableau.recupTFTD(compteId, fileId, exerciceId);
      resData.tfti = await recupTableau.recupTFTI(compteId, fileId, exerciceId);
      resData.evcp = await recupTableau.recupEVCP(compteId, fileId, exerciceId);

      // resData.drf = await getAutreTableau(compteId, fileId, exerciceId, 'DRF', 0);
      // resData.bhiapc = await getAutreTableau(compteId, fileId, exerciceId, 'BHIAPC', 0);
      // resData.mp = await getAutreTableau(compteId, fileId, exerciceId, 'MP', 0);
      // resData.da = await getAutreTableau(compteId, fileId, exerciceId, 'DA', 0);
      // resData.dp = await getAutreTableau(compteId, fileId, exerciceId, 'DP', 0);
      // resData.eiafnc = await getAutreTableau(compteId, fileId, exerciceId, 'EIAFNC', 0);
      // resData.sad = await getAutreTableau(compteId, fileId, exerciceId, 'SAD', 0);
      // resData.sdr = await getAutreTableau(compteId, fileId, exerciceId, 'SDR', 0);
      // resData.se = await getAutreTableau(compteId, fileId, exerciceId, 'SE', 0);
      // resData.ne = await getAutreTableau(compteId, fileId, exerciceId, 'NE', 0);

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

  // resData.list1  = await getTableau(Number(compteId), Number(fileId), Number(exerciceId), tableau, 1);
  // resData.list2  = await getTableau(Number(compteId), Number(fileId), Number(exerciceId), tableau, 2);
 
  // if(tableau === 'BILAN' || tableau === 'CRN' || tableau === 'CRF'|| tableau === 'TFTD'|| tableau === 'TFTI'){
  //   if(tableau === 'BILAN'){
  //     resData.list1  = await getTableau(Number(compteId), Number(fileId), Number(exerciceId), tableau, 1);
  //     resData.list2  = await getTableau(Number(compteId), Number(fileId), Number(exerciceId), tableau, 2);
  //     resData.state = true;
  //   }else{
  //     resData.list1  = await getTableau(Number(compteId), Number(fileId), Number(exerciceId), tableau, 0);
  //     resData.state = true;
  //   }
    
  // }else{
  //   resData.list1 = await getAutreTableau(Number(compteId), Number(fileId), Number(exerciceId), tableau, 0);
  //   resData.state = true;
  // }
  
    resData.state = true;
    res.status(200).json(resData);

  }catch (error){
    console.error('ERREUR getListeOneTable:', error);
    res.status(500).json({ state: false, error: error.message });
  }
    
}

// const getListeRubriqueIndividual = async (req, res)  => {
//     try{
//       const {compteId, fileId, exerciceId, tableau} = req.body;

//       let resData = {
//         state: false,
//         msg: '',
//         bilanActif: [],
//         bilanPassif: [],
//         crn: [],
//         crf: [],
//         tftd: [],
//         tfti: [],
//         evcp: [],
//         drf: [],
//         bhiapc: [],
//         mp: [],
//         da: [],
//         dp: [],
//         eiafnc: [],
//         sad: [],
//         sdr: [],
//         se: [],
//         ne: [],
//       }

//       if(tableau === 'BILAN'){
//         resData.bilanActif  = await getTableau(compteId, fileId, exerciceId, 'BILAN', 1);
//         resData.bilanPassif = await getTableau(compteId, fileId, exerciceId, 'BILAN', 2);
//         resData.state = true;
//       }else if(tableau === 'CRN'){
//         resData.crn = await getTableau(compteId, fileId, exerciceId, 'CRN', 0);
//         resData.state = true;
//       }else if(tableau === 'CRF'){
//         resData.crf = await getTableau(compteId, fileId, exerciceId, 'CRF', 0);
//         resData.state = true;
//       }else if(tableau === 'TFTD'){
//         resData.tftd = await getTableau(compteId, fileId, exerciceId, 'TFTD', 0);
//         resData.state = true;
//       }else if(tableau === 'TFTI'){
//         resData.tfti = await getTableau(compteId, fileId, exerciceId, 'TFTI', 0);
//         resData.state = true;
//       }else if(tableau === 'EVCP'){
//         resData.evcp = await getAutreTableau(compteId, fileId, exerciceId, 'EVCP');
//         resData.state = true;
//       }else if(tableau === 'DRF'){
//         resData.drf = await getAutreTableau(compteId, fileId, exerciceId, 'DRF', 0);
//         resData.state = true;
//       }else if(tableau === 'BHIAPC'){
//         resData.bhiapc = await getAutreTableau(compteId, fileId, exerciceId, 'BHIAPC', 0);
//         resData.state = true;
//       }else if(tableau === 'MP'){
//         resData.mp = await getAutreTableau(compteId, fileId, exerciceId, 'MP', 0);
//         resData.state = true;
//       }else if(tableau === 'DA'){
//         const { liste } = await getAutreTableau(compteId, fileId, exerciceId, 'DA', 0);
//         resData.da = liste;
//         resData.state = true;
//       }else if(tableau === 'DP'){
//         resData.dp = await getAutreTableau(compteId, fileId, exerciceId, 'DP', 0);
//         resData.state = true;
//       }else if(tableau === 'EIAFNC'){
//         resData.eiafnc = await getAutreTableau(compteId, fileId, exerciceId, 'EIAFNC', 0);
//         resData.state = true;
//       }else if(tableau === 'SAD'){
//         resData.sad = await getAutreTableau(compteId, fileId, exerciceId, 'SAD', 0);
//         resData.state = true;
//       }else if(tableau === 'SDR'){
//         resData.sdr = await getAutreTableau(compteId, fileId, exerciceId, 'SDR', 0);
//         resData.state = true;
//       }else if(tableau === 'SE'){
//         resData.se = await getAutreTableau(compteId, fileId, exerciceId, 'SE', 0);
//         resData.state = true;
//       }else if(tableau === 'NE'){
//         resData.ne = await getAutreTableau(compteId, fileId, exerciceId, 'NE', 0);
//         resData.state = true;
//       }

//       return res.json(resData);
//     }catch (error){
//       //console.log(error);
//       console.error("Erreur dans getListeRubriqueIndividual :", error);
//       return res.status(500).json({ state: false, msg: "Erreur serveur", error });
//     }
//   }

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
          list2: []
        }

        if(tableau === 'BILAN'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshBILAN(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupBILAN_ACTIF(compteId, fileId, exerciceId);
            resData.list2 = await recupTableau.recupBILAN_PASSIF(compteId, fileId, exerciceId);
            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }
        }else if(tableau === 'CRN'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshCRN(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupCRN(compteId, fileId, exerciceId);
            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'CRF'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshCRF(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupCRF(compteId, fileId, exerciceId);
            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'TFTD'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshTFTD(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupTFTD(compteId, fileId, exerciceId);
            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'TFTI'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshTFTI(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupTFTI(compteId, fileId, exerciceId);
            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }else if(tableau === 'EVCP'){
          const { stateRefresh } = await declEbilanRefreshFunction.refreshEVCP(compteId, fileId, exerciceId, refreshTotal);

          if(stateRefresh){
            resData.list1 = await recupTableau.recupEVCP(compteId, fileId, exerciceId);
            resData.state = true;
            resData.msg = `Mise à jour des calculs du tableau ${tableau} terminées avec succès.`
          }       
        }
        
        return res.json(resData);
      }catch (error){
        console.log(error);
      }
    }

    const updateTableau = async (compteId, fileId, exerciceId, tableau, refreshTotal) => {
      try{
        let actionStatus = false;

        const liste= await rubriquesmatrices.findAll({
          where: {
            id_etat: tableau,
          },
          raw:true,
          order: [['ordre', 'ASC']]
        });

        let tableSource = db;

        if(tableau === 'BILAN'){

          const { refresh } = await declEbilanRefreshFunction.refreshBILAN(compteId, fileId, exerciceId, refreshTotal);

          if(refresh){
            actionStatus = true;
          }
        }else if(tableau === 'CRN'){
          tableSource = db.liassecrns;
        }else if(tableau === 'CRF'){
          tableSource = db.liassecrfs;
        }else if(tableau === 'TFTD'){
          tableSource = db.liassetftds;
        }else if(tableau === 'TFTI'){
          tableSource = db.liassetftis;
        }else if(tableau === 'EVCP'){
          tableSource = db.liasseevcps;
        }else if(tableau === 'DRF'){
          const { refresh } = await declEbilanRefreshFunction.refreshDRF(compteId, fileId, exerciceId, liste);

          if(refresh){
            actionStatus = true;
          }
        }else if(tableau === 'BHIAPC'){
          tableSource = db.liassebhiapcs;
        }else if(tableau === 'MP'){
          tableSource = db.liassemps;
        }else if(tableau === 'DA'){
          tableSource = db.liassedas;
        }else if(tableau === 'DP'){
          const { refresh } = await declEbilanRefreshFunction.refreshDP(compteId, fileId, exerciceId, liste);

          if(refresh){
            actionStatus = true;
          }

        }else if(tableau === 'EIAFNC'){
          
          const { refresh } = await declEbilanRefreshFunction.refreshEIAFNC(compteId, fileId, exerciceId, liste);

          if(refresh){
            actionStatus = true;
          }

        }else if(tableau === 'SAD'){
          
          const { refresh } = await declEbilanRefreshFunction.refreshSAD(compteId, fileId, exerciceId, liste);

          if(refresh){
            actionStatus = true;
          }

        }else if(tableau === 'SDR'){
          
          const { refresh } = await declEbilanRefreshFunction.refreshSDR(compteId, fileId, exerciceId, liste);

          if(refresh){
            actionStatus = true;
            // resData.state = true;
            // resData.msg = "Actualisation des calculs terminée avec succès.";
          }

        }else if(tableau === 'SE'){
          tableSource = db.liasseses;
        }else if(tableau === 'NE'){
          tableSource = db.liassenotes;
        }

        // if(liste){
        //   await tableSource.destroy({
        //     where: 
        //     {
        //       id_compte: compteId,
        //       id_dossier: fileId,
        //       id_exercice: exerciceId,
        //       id_etat: tableau
        //     }
        //   });

        //   if(tableau === 'DRF'){
        //     liste.map(async (item) => {
        //       await tableSource.create({
        //         id_compte: compteId,
        //         id_dossier : fileId,
        //         id_exercice: exerciceId,
        //         id_etat: item.id_etat,
        //         id_rubrique: item.id_rubrique,
        //         note: item.note,
        //         nature: item.nature,
        //         ordre: item.ordre,
        //         niveau: item.niveau,
        //         signe: item.senscalcul
        //       });
        //     });
        //   }else{
        //     liste.map(async (item) => {
        //       await tableSource.create({
        //         id_compte: compteId,
        //         id_dossier : fileId,
        //         id_exercice: exerciceId,
        //         id_etat: item.id_etat,
        //         id_rubrique: item.id_rubrique,
        //         note: item.note,
        //         nature: item.nature,
        //         ordre: item.ordre,
        //         niveau: item.niveau,
              
        //       });
        //     });
        //   }
          
        //}
        return { actionStatus };
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
            //resData.liste = await getAutreTableau(compteId, fileId, exerciceId, 'BHIAPC', 0);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            //resData.liste = await getAutreTableau(compteId, fileId, exerciceId, 'BHIAPC', 0);
          }

        }else if(tableau === 'MP'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowMP(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
            //resData.liste = await getAutreTableau(compteId, fileId, exerciceId, 'MP', 0);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            //resData.liste = await getAutreTableau(compteId, fileId, exerciceId, 'MP', 0);
          }

        }else if(tableau === 'DA'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowDA(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
          }

        }else if(tableau === 'DP'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowDP(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
            //resData.liste = await getAutreTableau(compteId, fileId, exerciceId, 'MP', 0);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            //resData.liste = await getAutreTableau(compteId, fileId, exerciceId, 'MP', 0);
          }

        }else if(tableau === 'EIAFNC'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowEIAFNC(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
            //resData.liste = await getAutreTableau(compteId, fileId, exerciceId, 'MP', 0);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            //resData.liste = await getAutreTableau(compteId, fileId, exerciceId, 'MP', 0);
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
            //resData.liste = await getAutreTableau(compteId, fileId, exerciceId, 'MP', 0);
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
            //resData.liste = await getAutreTableau(compteId, fileId, exerciceId, 'MP', 0);
          }

        }else if(tableau === 'NE'){
          
          const {stateModify, stateAdd } = await functionAddOrModifyRow.addOrmodifyRowNE(compteId,fileId, exerciceId, formData);
          
          if(stateModify){
            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
          }

          if(stateAdd){
            resData.state = true;
            resData.msg = "Ajout de nouvelle ligne effectué avec succès.";
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
          liste: []
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
          liste: []
        }

        let tableSource = db;

        if(tableauToDeleteAllRow === 'BHIAPC'){
          tableSource = db.liassebhiapcs;
        }else if(tableauToDeleteAllRow === 'MP'){
          tableSource = db.liassemps;
        }else if(tableauToDeleteAllRow === 'DA'){
          tableSource = db.liassedas;
        }else if(tableauToDeleteAllRow === 'DP'){

          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowDP(compteId, fileId, exerciceId);
          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
          }

        }else if(tableauToDeleteAllRow === 'EIAFNC'){
          
          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowEIAFNC(compteId, fileId, exerciceId);
          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
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
          }

        }else if(tableauToDeleteAllRow === 'NE'){
          
          const stateDeleting = await declEbilanDeleteFunction.deleteAllRowNE(compteId, fileId, exerciceId);
          if(stateDeleting){
            resData.state = true;
            resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
          }
          
        }

        // const deletedRow = await tableSource.destroy({
        //   where: 
        //     {
        //       id_compte: compteId,
        //       id_dossier : fileId,
        //       id_exercice: exerciceId,
        //     }
        // });

        // if(deletedRow){
        //   resData.state = true;
        //   resData.msg = "Suppression de toute les lignes du tableau effectuée avec succès.";
        // }

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
      deleteAjustement
    };
