const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();

const dossierPlanComptable = db.dossierplancomptable;
const dossierPlanComptableCopy = db.dossierplancomptable;
const dossierpcdetailcptchg = db.dossierpcdetailcptchg;
const dossierpcdetailcpttva = db.dossierpcdetailcpttva;
const dossiers = db.dossiers;

dossierPlanComptable.belongsTo(dossierPlanComptableCopy, { as: 'BaseAux', foreignKey: 'baseaux_id' , targetKey: 'id'});

const recupPc = async (req, res) => {
 try {
    const { fileId } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      liste: []
    }

    const listepc = await dossierPlanComptable.findAll({
      where: 
        {
          id_dossier: fileId
        },
      include: [
        { model: dossierPlanComptable, 
          as: 'BaseAux',
          attributes: [
            ['compte', 'comptecentr']
          ],
          required: false,
          where: {
            id_dossier: fileId
          }
        },
      ],
      raw:true,
      order: [['compte', 'ASC']]
    });

    if(listepc){
      resData.state = true;
      resData.liste = listepc;
    }else{
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données";
    }

    return res.json(resData);
 } catch (error) {
   console.log(error);
 }
};

 const AddCptToPc = async (req, res) => {
  try{
    const {
      action,
      itemId, 
      idCompte,
      idDossier,
      compte,
      libelle,
      nature,
      baseCptCollectif,
      typeTier,
      nif,
      stat,
      adresse,
      motcle,
      cin,
      dateCin,
      autrePieceID,
      refPieceID,
      adresseSansNIF,
      nifRepresentant,
      adresseEtranger,
      pays,
      listeCptChg,
      listeCptTva
    } = req.body;

    const DossierParam = await dossiers.findOne({
      where: {
        id : idDossier,
        id_compte: idCompte
      }
    });

    const longueurcptaux = DossierParam.longcompteaux;
    const longueurcptstd = DossierParam.longcomptestd;
    const autocompletion = DossierParam.autocompletion;

     if(action === "new"){
      let resData = {
        state: false,
        msg: ''
      };

      if(typeTier === "sans-nif"){
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if(nature ==='General' || nature ==='Collectif'){
          baseauxiliaire = compte;

          const findedID = await dossierPlanComptable.findOne({
            where:
              {
                id_compte: idCompte,
                id_dossier: idDossier,
                compte: compte
              }
          });

          if(findedID){
            baseaux_id = findedID.id;
          }
        }else{
          const findedID = await dossierPlanComptable.findOne({
            where:
              {
                id: baseCptCollectif
              }
          });

          baseaux_id = baseCptCollectif;

          if(findedID){
            baseauxiliaire = findedID.compte;
          }
        }

        let compteFormated = '';
        let baseAux = '';
  
        // Formatage compte & baseaux selon les règles métier
        if (autocompletion) {
          if (nature === "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux) || '';
          } else {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          }
        } else {
          if (nature !== "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          } else {
            compteFormated = compte;
            baseAux = baseauxiliaire;
          }
        }

        let cptChNb = 0;
        if(listeCptChg.length > 0){
          cptChNb = listeCptChg.length;
        }
  
        let cptTvaNb = 0;
        if(listeCptTva.length > 0){
          cptTvaNb = listeCptTva.length;
        }
  
        const NewCptAdded = await dossierPlanComptable.create({
          id_compte: idCompte,
          id_dossier: idDossier,
          compte: compteFormated,
          libelle: libelle,
          nature: nature,
          baseaux: baseAux,
          cptcharge: cptChNb,
          cpttva: cptTvaNb,
  
          typetier: typeTier,
          cin: cin,
          datecin: dateCin,
          autrepieceid: autrePieceID,
          refpieceid: refPieceID,
          adressesansnif: adresseSansNIF,
          motcle: motcle,
          baseaux_id: baseaux_id
        });
  
        //Enregistrer les compte de charges et TVA associés au compte
        if(listeCptChg.length > 0){
          listeCptChg.map(async (item) => {
            const saveCptCh = await dossierpcdetailcptchg.create({
              id_compte: idCompte,
              id_dossier : idDossier,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }
  
        if(listeCptTva.length > 0){
          listeCptTva.map(async (item) => {
            const saveCptTva = await dossierpcdetailcpttva.create({
              id_compte: idCompte,
              id_dossier : idDossier,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }
        
        resData.state = true;
        resData.msg = "Le nouveau compte a été enregistré avec succès";
      }
  
      if(typeTier === "avec-nif"){
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if(nature ==='General' || nature ==='Collectif'){
          baseauxiliaire = compte;

          const findedID = await dossierPlanComptable.findOne({
            where:
              {
                id_compte: idCompte,
                id_dossier: idDossier,
                compte: compte
              }
          });

          if(findedID){
            baseaux_id = findedID.id;
          }
        }else{
          const findedID = await dossierPlanComptable.findOne({
            where:
              {
                id: baseCptCollectif
              }
          });

          baseaux_id = baseCptCollectif;

          if(findedID){
            baseauxiliaire = findedID.compte;
          }
        }

        let compteFormated = '';
        let baseAux = '';
  
        // Formatage compte & baseaux selon les règles métier
        if (autocompletion) {
          if (nature === "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux) || '';
          } else {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          }
        } else {
          if (nature !== "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          } else {
            compteFormated = compte;
            baseAux = baseauxiliaire;
          }
        }
  
        let cptChNb = 0;
        if(listeCptChg.length > 0){
          cptChNb = listeCptChg.length;
        }
  
        let cptTvaNb = 0;
        if(listeCptTva.length > 0){
          cptTvaNb = listeCptTva.length;
        }
  
        const NewCptAdded = await dossierPlanComptable.create({
          id_compte: idCompte,
          id_dossier : idDossier,
          compte: compteFormated,
          libelle: libelle,
          nature: nature,
          baseaux: baseAux,
          cptcharge: cptChNb,
          cpttva: cptTvaNb,
  
          typetier: typeTier,
          nif: nif,
          statistique: stat,
          adresse: adresse,
          motcle: motcle,
          baseaux_id: baseaux_id
        });
  
        //Enregistrer les compte de charges et TVA associés au compte
        if(listeCptChg.length > 0){
          listeCptChg.map(async (item) => {
            const saveCptCh = await dossierpcdetailcptchg.create({
              id_compte: idCompte,
              id_dossier : idDossier,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }
  
        if(listeCptTva.length > 0){
          listeCptTva.map(async (item) => {
            const saveCptTva = await dossierpcdetailcpttva.create({
              id_compte: idCompte,
              id_dossier : idDossier,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }
        
        resData.state = true;
        resData.msg = "Le nouveau compte a été enregistré avec succès";
      }
  
      if(typeTier === "etranger"){
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if(nature ==='General' || nature ==='Collectif'){
          baseauxiliaire = compte;

          const findedID = await dossierPlanComptable.findOne({
            where:
              {
                id_compte: idCompte,
                id_dossier: idDossier,
                compte: compte
              }
          });

          if(findedID){
            baseaux_id = findedID.id;
          }
        }else{
          const findedID = await dossierPlanComptable.findOne({
            where:
              {
                id: baseCptCollectif
              }
          });

          baseaux_id = baseCptCollectif;

          if(findedID){
            baseauxiliaire = findedID.compte;
          }
        }

        let compteFormated = '';
        let baseAux = '';
  
        // Formatage compte & baseaux selon les règles métier
        if (autocompletion) {
          if (nature === "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux) || '';
          } else {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          }
        } else {
          if (nature !== "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          } else {
            compteFormated = compte;
            baseAux = baseauxiliaire;
          }
        }
  
        let cptChNb = 0;
        if(listeCptChg.length > 0){
          cptChNb = listeCptChg.length;
        }
  
        let cptTvaNb = 0;
        if(listeCptTva.length > 0){
          cptTvaNb = listeCptTva.length;
        }
  
        const NewCptAdded = await dossierPlanComptable.create({
          id_compte: idCompte,
          id_dossier : idDossier,
          compte: compteFormated,
          libelle: libelle,
          nature: nature,
          baseaux: baseAux,
          cptcharge: cptChNb,
          cpttva: cptTvaNb,
  
          typetier: typeTier,
          nifrepresentant: nifRepresentant,
          adresseetranger: adresseEtranger,
          pays: pays,
          motcle: motcle,
          baseaux_id: baseaux_id
        });
  
        //Enregistrer les compte de charges et TVA associés au compte
        if(listeCptChg.length > 0){
          listeCptChg.map(async (item) => {
            const saveCptCh = await dossierpcdetailcptchg.create({
              id_compte: idCompte,
              id_dossier : idDossier,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }
  
        if(listeCptTva.length > 0){
          listeCptTva.map(async (item) => {
            const saveCptTva = await dossierpcdetailcpttva.create({
              id_compte: idCompte,
              id_dossier : idDossier,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }
        
        resData.state = true;
        resData.msg = "Le nouveau compte a été enregistré avec succès";
      }

      if(typeTier === "general"){
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if(nature ==='General' || nature ==='Collectif'){
          baseauxiliaire = compte;

          const findedID = await dossierPlanComptable.findOne({
            where:
              {
                id_compte: idCompte,
                id_dossier: idDossier,
                compte: compte
              }
          });

          if(findedID){
            baseaux_id = findedID.id;
          }
        }else{
          const findedID = await dossierPlanComptable.findOne({
            where:
              {
                id: baseCptCollectif
              }
          });

          baseaux_id = baseCptCollectif;

          if(findedID){
            baseauxiliaire = findedID.compte;
          }
        }

        let compteFormated = '';
        let baseAux = '';
  
        // Formatage compte & baseaux selon les règles métier
        if (autocompletion) {
          if (nature === "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux) || '';
          } else {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          }
        } else {
          if (nature !== "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          } else {
            compteFormated = compte;
            baseAux = baseauxiliaire;
          }
        }
  
        let cptChNb = 0;
        if(listeCptChg.length > 0){
          cptChNb = listeCptChg.length;
        }
  
        let cptTvaNb = 0;
        if(listeCptTva.length > 0){
          cptTvaNb = listeCptTva.length;
        }
  
        const NewCptAdded = await dossierPlanComptable.create({
          id_compte: idCompte,
          id_dossier : idDossier,
          compte: compteFormated,
          libelle: libelle,
          nature: nature,
          baseaux: baseAux,
          cptcharge: cptChNb,
          cpttva: cptTvaNb,
  
          typetier: typeTier,
          pays: 'Madagascar',
          motcle: motcle,
          baseaux_id: baseaux_id
        });
  
        //Enregistrer les compte de charges et TVA associés au compte
        if(listeCptChg.length > 0){
          listeCptChg.map(async (item) => {
            const saveCptCh = await dossierpcdetailcptchg.create({
              id_compte: idCompte,
              id_dossier : idDossier,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }
  
        if(listeCptTva.length > 0){
          listeCptTva.map(async (item) => {
            const saveCptTva = await dossierpcdetailcpttva.create({
              id_compte: idCompte,
              id_dossier : idDossier,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }
        
        resData.state = true;
        resData.msg = "Le nouveau compte a été enregistré avec succès";
      }
    
      res.json(resData);

     }else{
        let resData = {
          state: false,
          msg: ''
        };

        if(typeTier === "sans-nif"){
          let baseauxiliaire = '';
          let baseaux_id = 0;

          if(nature ==='General' || nature ==='Collectif'){
            baseauxiliaire = compte;

            const findedID = await dossierPlanComptable.findOne({
              where:
                {
                  id_compte: idCompte,
                  id_dossier: idDossier,
                  compte: compte
                }
            });
  
            if(findedID){
              baseaux_id = findedID.id;
            }
          }else{
            const findedID = await dossierPlanComptable.findOne({
              where:
                {
                  id: baseCptCollectif
                }
            });
  
            baseaux_id = baseCptCollectif;
  
            if(findedID){
              baseauxiliaire = findedID.compte;
            }
          }

          let compteFormated = '';
        let baseAux = '';
  
        // Formatage compte & baseaux selon les règles métier
        if (autocompletion) {
          if (nature === "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux) || '';
          } else {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          }
        } else {
          if (nature !== "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          } else {
            compteFormated = compte;
            baseAux = baseauxiliaire;
          }
        }

          let cptChNb = 0;
          if(listeCptChg.length > 0){
            cptChNb = listeCptChg.length;
          }
    
          let cptTvaNb = 0;
          if(listeCptTva.length > 0){
            cptTvaNb = listeCptTva.length;
          }
    
          const NewCptAdded = await dossierPlanComptable.update(
              {
              id_compte: idCompte,
              id_dossier : idDossier,
              compte: compteFormated,
              libelle: libelle,
              nature: nature,
              baseaux: baseAux,
              cptcharge: cptChNb,
              cpttva: cptTvaNb,
      
              typetier: typeTier,
              cin: cin,
              datecin: dateCin,
              autrepieceid: autrePieceID,
              refpieceid: refPieceID,
              adressesansnif: adresseSansNIF,
              motcle: motcle,
              baseaux_id: baseaux_id
            },
            {
              where: {
                id: itemId,
              }
            }
          );
    
          //Enregistrer les compte de charges et TVA associés au compte
          if(listeCptChg.length > 0){
            listeCptChg.map(async (item) => {
              //supprimer l'ancienne ligne
              await dossierpcdetailcptchg.destroy({where: {id: item.id}});

              const saveCptCh = await dossierpcdetailcptchg.create({
                id_compte: idCompte,
                id_dossier : idDossier,
                id_detail: itemId,
                compte: item.compte,
                libelle: item.libelle,
                id_comptecompta: item.idCpt
              });
            });
          }
    
          if(listeCptTva.length > 0){
            listeCptTva.map(async (item) => {
              //supprimer l'ancienne ligne
              await dossierpcdetailcpttva.destroy({where: {id: item.id}});

              const saveCptTva = await dossierpcdetailcpttva.create({
                id_compte: idCompte,
                id_dossier : idDossier,
                id_detail: itemId,
                compte: item.compte,
                libelle: item.libelle,
                id_comptecompta: item.idCpt
              });
            });
          }
          
          resData.state = true;
          resData.msg = "Les modifications ont été enregistrées avec succès";
        }
    
        if(typeTier === "avec-nif"){
          let baseauxiliaire = '';
          let baseaux_id = 0;

          if(nature ==='General' || nature ==='Collectif'){
            baseauxiliaire = compte;

            const findedID = await dossierPlanComptable.findOne({
              where:
                {
                  id_compte: idCompte,
                  id_dossier: idDossier,
                  compte: compte
                }
            });
  
            if(findedID){
              baseaux_id = findedID.id;
            }
          }else{
            const findedID = await dossierPlanComptable.findOne({
              where:
                {
                  id: baseCptCollectif
                }
            });
  
            baseaux_id = baseCptCollectif;
  
            if(findedID){
              baseauxiliaire = findedID.compte;
            }
          }

          let compteFormated = '';
        let baseAux = '';
  
        // Formatage compte & baseaux selon les règles métier
        if (autocompletion) {
          if (nature === "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux) || '';
          } else {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          }
        } else {
          if (nature !== "Aux") {
            compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
            baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
          } else {
            compteFormated = compte;
            baseAux = baseauxiliaire;
          }
        }
    
          let cptChNb = 0;
          if(listeCptChg.length > 0){
            cptChNb = listeCptChg.length;
          }
    
          let cptTvaNb = 0;
          if(listeCptTva.length > 0){
            cptTvaNb = listeCptTva.length;
          }
    
          const NewCptAdded = await dossierPlanComptable.update(
            {
              id_compte: idCompte,
              id_dossier : idDossier,
              compte: compteFormated,
              libelle: libelle,
              nature: nature,
              baseaux: baseAux,
              cptcharge: cptChNb,
              cpttva: cptTvaNb,
      
              typetier: typeTier,
              nif: nif,
              statistique: stat,
              adresse: adresse,
              motcle: motcle,
              baseaux_id: baseaux_id
            },
            {
              where: {id : itemId}
            }
        );
    
          //Enregistrer les compte de charges et TVA associés au compte
          if(listeCptChg.length > 0){
            listeCptChg.map(async (item) => {
              //supprimer l'ancienne ligne
              await dossierpcdetailcptchg.destroy({where: {id: item.id}});

              const saveCptCh = await dossierpcdetailcptchg.create({
                id_compte: idCompte,
                id_dossier : idDossier,
                id_detail: itemId,
                compte: item.compte,
                libelle: item.libelle,
                id_comptecompta: item.idCpt
              });
            });
          }
    
          if(listeCptTva.length > 0){
            listeCptTva.map(async (item) => {
              //supprimer l'ancienne ligne
              await dossierpcdetailcpttva.destroy({where: {id: item.id}});

              const saveCptTva = await dossierpcdetailcpttva.create({
                id_compte: idCompte,
                id_dossier : idDossier,
                id_detail: itemId,
                compte: item.compte,
                libelle: item.libelle,
                id_comptecompta: item.idCpt
              });
            });
          }
          
          resData.state = true;
          resData.msg = "Les modifications ont été enregistrées avec succès";
        }
    
        if(typeTier === "etranger"){
          let baseauxiliaire = '';
          let baseaux_id = 0;

          if(nature ==='General' || nature ==='Collectif'){
            baseauxiliaire = compte;

            const findedID = await dossierPlanComptable.findOne({
              where:
                {
                  id_compte: idCompte,
                  id_dossier: idDossier,
                  compte: compte
                }
            });
  
            if(findedID){
              baseaux_id = findedID.id;
            }
          }else{
            const findedID = await dossierPlanComptable.findOne({
              where:
                {
                  id: baseCptCollectif
                }
            });
  
            baseaux_id = baseCptCollectif;
  
            if(findedID){
              baseauxiliaire = findedID.compte;
            }
          }

          let compteFormated = '';
          let baseAux = '';
    
          // Formatage compte & baseaux selon les règles métier
          if (autocompletion) {
            if (nature === "Aux") {
              compteFormated = compte.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux);
              baseAux = baseauxiliaire.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux) || '';
            } else {
              compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
              baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
            }
          } else {
            if (nature !== "Aux") {
              compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
              baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
            } else {
              compteFormated = compte;
              baseAux = baseauxiliaire;
            }
          }
    
          let cptChNb = 0;
          if(listeCptChg.length > 0){
            cptChNb = listeCptChg.length;
          }
    
          let cptTvaNb = 0;
          if(listeCptTva.length > 0){
            cptTvaNb = listeCptTva.length;
          }
    
          const NewCptAdded = await dossierPlanComptable.update(
            {
              id_compte: idCompte,
              id_dossier : idDossier,
              compte: compteFormated,
              libelle: libelle,
              nature: nature,
              baseaux: baseAux,
              cptcharge: cptChNb,
              cpttva: cptTvaNb,
      
              typetier: typeTier,
              nifrepresentant: nifRepresentant,
              adresseetranger: adresseEtranger,
              pays: pays,
              motcle: motcle,
              baseaux_id: baseaux_id
            },
            {
              where: {id : itemId}
            }
          );
    
          //Enregistrer les compte de charges et TVA associés au compte
          if(listeCptChg.length > 0){
            listeCptChg.map(async (item) => {
              //supprimer l'ancienne ligne
              await dossierpcdetailcptchg.destroy({where: {id: item.id}});

              const saveCptCh = await dossierpcdetailcptchg.create({
                id_compte: idCompte,
                id_dossier : idDossier,
                id_detail: itemId,
                compte: item.compte,
                libelle: item.libelle,
                id_comptecompta: item.idCpt
              });
            });
          }
    
          if(listeCptTva.length > 0){
            listeCptTva.map(async (item) => {
              //supprimer l'ancienne ligne
              await dossierpcdetailcpttva.destroy({where: {id: item.id}});

              const saveCptTva = await dossierpcdetailcpttva.create({
                id_compte: idCompte,
                id_dossier : idDossier,
                id_detail: itemId,
                compte: item.compte,
                libelle: item.libelle,
                id_comptecompta: item.idCpt
              });
            });
          }
          
          resData.state = true;
          resData.msg = "Les modifications ont été enregistrées avec succès";
        }

        if(typeTier === "general"){
          let baseauxiliaire = '';
          let baseaux_id = 0;

          if(nature ==='General' || nature ==='Collectif'){
            baseauxiliaire = compte;

            const findedID = await dossierPlanComptable.findOne({
              where:
                {
                  id_compte: idCompte,
                  id_dossier: idDossier,
                  compte: compte
                }
            });
  
            if(findedID){
              baseaux_id = findedID.id;
            }
          }else{
            const findedID = await dossierPlanComptable.findOne({
              where:
                {
                  id: baseCptCollectif
                }
            });
  
            baseaux_id = baseCptCollectif;
  
            if(findedID){
              baseauxiliaire = findedID.compte;
            }
          }

          let compteFormated = '';
          let baseAux = '';
    
          // Formatage compte & baseaux selon les règles
          if (autocompletion) {
            if (nature === "Aux") {
              compteFormated = compte.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux);
              baseAux = baseauxiliaire.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux) || '';
            } else {
              compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
              baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
            }
          } else {
            if (nature !== "Aux") {
              compteFormated = compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
              baseAux = baseauxiliaire.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
            } else {
              compteFormated = compte;
              baseAux = baseauxiliaire;
            }
          }
    
          let cptChNb = 0;
          if(listeCptChg.length > 0){
            cptChNb = listeCptChg.length;
          }
    
          let cptTvaNb = 0;
          if(listeCptTva.length > 0){
            cptTvaNb = listeCptTva.length;
          }
    
          const NewCptAdded = await dossierPlanComptable.update(
            {
              id_compte: idCompte,
              id_dossier : idDossier,
              compte: compteFormated,
              libelle: libelle,
              nature: nature,
              baseaux: baseAux,
              cptcharge: cptChNb,
              cpttva: cptTvaNb,
      
              typetier: typeTier,
              pays: 'Madagascar',
              motcle: motcle,
              baseaux_id: baseaux_id
            },
            {
              where: {id : itemId}
            }
          );
    
          //Enregistrer les compte de charges et TVA associés au compte
          if(listeCptChg.length > 0){
            listeCptChg.map(async (item) => {
              //supprimer l'ancienne ligne
              await dossierpcdetailcptchg.destroy({where: {id: item.id}});

              const saveCptCh = await dossierpcdetailcptchg.create({
                id_compte: idCompte,
                id_dossier : idDossier,
                id_detail: itemId,
                compte: item.compte,
                libelle: item.libelle,
                id_comptecompta: item.idCpt
              });
            });
          }
    
          if(listeCptTva.length > 0){
            listeCptTva.map(async (item) => {
              //supprimer l'ancienne ligne
              await dossierpcdetailcpttva.destroy({where: {id: item.id}});

              const saveCptTva = await dossierpcdetailcpttva.create({
                id_compte: idCompte,
                id_dossier : idDossier,
                id_detail: itemId,
                compte: item.compte,
                libelle: item.libelle,
                id_comptecompta: item.idCpt
              });
            });
          }
          
          resData.state = true;
          resData.msg = "Les modifications ont été enregistrées avec succès";
        }
      
        res.json(resData);
     }
  }catch (error) {
    console.log(error);
  }
 }

 const keepListCptChgTvaAssoc = async (req, res) => {
  try {
    let resData = {
      state: false,
      msg: '',
      detailChg: [],
      detailTva: []
    }

     const itemId = req.params.itemId;
     const listeDetailModelCptChgData = await dossierpcdetailcptchg.findAll({
       where: {
           id_detail: itemId
           },
       order: [['compte', 'ASC']]
     });

     const listeDetailModelCptTvaData = await dossierpcdetailcpttva.findAll({
      where: {
          id_detail: itemId
          },
      order: [['compte', 'ASC']]
    });
 
    if (listeDetailModelCptChgData || listeDetailModelCptTvaData) {
     
        resData.state = true;
        resData.msg =  '';
        resData.detailChg = listeDetailModelCptChgData;
        resData.detailTva = listeDetailModelCptTvaData;
        
      } else {
        resData.state = false;
        resData.msg =  'Une erreur est survenue lors de la récupération des données';
      }
    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
 };

 const deleteItemPc = async (req, res) => {
    try{
      let resData = {
        state: false,
        stateUndeletableCpt: false,
        msg: 'Une erreur est survenue lors du traitement.',
        msgUndeletableCpt:''
      }

      let msgErrorDelete = '';
      const {listId, compteId, fileId } = req.body;

      if(listId.length >= 1){
        for (let i = 0; i < listId.length; i++){
          //tester si le compte est lié à un compte auxiliaire
          const infosCpt = await dossierPlanComptable.findOne({
            where: {id : listId[i]}
          });

          let cpt = '';
          if(infosCpt){
            cpt = infosCpt.compte;
          }
          
          const cptInUse = await dossierPlanComptable.findAll({
            where: {
              id_compte: compteId,
              id_dossier: fileId,
              baseaux : cpt,
            }
          });

          if(cptInUse.length > 1){
            resData.stateUndeletableCpt = true;
            if(msgErrorDelete === ''){
              msgErrorDelete = `Impossible de supprimer les comptes suivants car ils sont utilisés comme base des comptes auxiliaires: ${cpt}`;
            }else{
              msgErrorDelete = `${msgErrorDelete}, ${cpt}`;
            }
            
          }else{
            await dossierPlanComptable.destroy({where: {id: listId[i]}});

            //supprimer si la ligne possède des comptes de charges ou TVA associés
            await dossierpcdetailcptchg.destroy({where: {id_detail: listId[i]}});
            await dossierpcdetailcpttva.destroy({where: {id_detail: listId[i]}});
          }
        }

        resData.state = true;
        resData.msg ="Les comptes séléctionés ont été supprimés avec succès.";
      }

      resData.msgUndeletableCpt = msgErrorDelete;
      return res.json(resData);
    } catch (error) {
      console.log(error);
    }
 }

module.exports = {
  recupPc,
  AddCptToPc,
  keepListCptChgTvaAssoc,
  deleteItemPc
};