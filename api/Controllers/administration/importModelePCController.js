const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const modelePlanComptable = db.modelePlanComptable;
const modeleplancomptabledetail = db.modeleplancomptabledetail;

const testModelePcName = async (req, res)  => {
  try{
    const { compteId, modeleName } = req.body; 

    let resData = {
      state: false,
      msg: '',
      list: []
    }

    //création des comptes généraux
   

    //récuperer la liste à jour des codes journaux
    const updatedList = await modelePlanComptable.findAll({
      where: 
        {
          id_compte: compteId,
          nom: modeleName
        },
        raw:true,
    });

    if(updatedList.length > 0){
      resData.state = true;
    }

    return res.json(resData);
  }catch (error){
    console.log(error);
  }
}

const importModelePc = async (req, res)  => {
  try{
    const { idCompte, nomModele, modelePcData } = req.body; 

    let resData = {
      state: false,
      msg: '',
      list: [],
      nbrligne: 0
    }

    let importSuccess = 1;

    //ajout du nom du modèle
    const modeleName = await modelePlanComptable.create({
      id_compte: idCompte,
      nom: nomModele,
      par_default: false,
    });

    if(modelePcData.length > 0){
      for(let item of modelePcData){
        let pays = 'Madagascar';
        if(item.pays !== ''){
          pays = item.pays;
        }

        //traitement date CIN
        let dateCin = null;
        if(item.datecin !=='' && item.datecin !== null){
          if(item.datecin.includes("/")){
            const [day, month, year] = item.datecin.split("/");
            dateCin = new Date(`${year}-${month}-${day}`);
          }
        }
        
        try{
          await modeleplancomptabledetail.create({
            id_compte: idCompte,
            id_modeleplancomptable: modeleName.id,
            compte: item.compte,
            libelle: item.libelle,
            nature: item.nature,
            baseaux: item.baseaux,
            typetier: item.typetier,
            cptcharge: 0,
            cpttva: 0,  
            nif: item.nif,
            statistique: item.statistique,
            adresse: item.adresse,
            motcle: '',
            cin: item.cin,
            datecin: dateCin,
            autrepieceid: item.autrepieceidentite,
            refpieceid: item.refpieceidentite,
            adressesansnif: item.adressesansnif,
            nifrepresentant: item.nifrepresentant,
            adresseetranger: item.adresserepresentant,
            pays: pays,
          });

          // await db.query(`
          //   UPDATE modeleplancomptabledetails as tableA SET
          //   baseaux_id = (SELECT id FROM modeleplancomptabledetails as tableB WHERE  tableB.compte = tableA.baseaux AND
          //   id_compte = :idCompte AND id_modeleplancomptable = :modeleId)
          //   WHERE  id_compte = :idCompte AND id_modeleplancomptable = :modeleId`
          // , {
          //   replacements: {
          //     idCompte: idCompte,
          //     modeleId: modeleName.id,
          //   },
          // });

          //mettre les id des compte centralisation
          const importedModel = await modeleplancomptabledetail.findAll({
            where:
            {
              id_compte: idCompte,
              id_modeleplancomptable: modeleName.id
            }
          });

          const importedModelTable = await modeleplancomptabledetail.findAll({
            where:
            {
              id_compte: idCompte,
              id_modeleplancomptable: modeleName.id
            }
          });

          if (importedModel) {
            await Promise.all(importedModel.map(async (item) => {
              // const baseauxItem = await modeleplancomptabledetail.findOne({
              //   where: {
              //     id_compte: idCompte,
              //     id_modeleplancomptable: modeleName.id,
              //     compte: item.baseaux
              //   }
              // });

              const baseauxItem = importedModelTable.find(cpt =>
                cpt.id_compte === String(idCompte) &&
                cpt.id_modeleplancomptable === String(modeleName.id) &&
                cpt.compte === item.baseaux
              );

              if (baseauxItem) {
                await modeleplancomptabledetail.update(
                  {
                    baseaux_id: baseauxItem.id
                  },
                  {
                    where: { id: item.id }
                  }
                );
              }
            }));
          }

          importSuccess = importSuccess*1;
        }catch (error){
          importSuccess = importSuccess*0;
          resData.msg = error;
        }
      };
    }else{
      resData.msg = `${modelePcData.length} lignes ont été importées avec succès`;
      resData.nbrligne = modelePcData.length;
      resData.state = true;
    }

    if(importSuccess === 1){
      resData.msg = `${modelePcData.length} lignes ont été importées avec succès`;
      resData.nbrligne = modelePcData.length;
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
  testModelePcName,
  importModelePc
};