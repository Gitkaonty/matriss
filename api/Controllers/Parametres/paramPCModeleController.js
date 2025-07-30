const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();

const dossier = db.dossiers;
const modelePlanComptable = db.modelePlanComptable;
const dossierPlanComptable = db.dossierplancomptable
const modeleplancomptabledetail = db.modeleplancomptabledetail;
const modeleplancomptabledetailcptchg = db.modeleplancomptabledetailcptchg;
const modeleplancomptabledetailcpttva = db.modeleplancomptabledetailcpttva;

modeleplancomptabledetail.belongsTo(modeleplancomptabledetail, { as: 'BaseAux', foreignKey: 'baseaux_id', targetKey: 'id' });

const recupListModelePlanComptable = async (req, res) => {
  try {
    const { compteId } = req.body;
    const listeModeleData = await modelePlanComptable.findAll({
      where: {
        id_compte: compteId
      },
      order: [['nom', 'ASC']]
    });

    if (listeModeleData) {
      const resData = {
        modelList: listeModeleData
      };
      //return res.status(201).send(JSON.stringify(listeModeleData));
      return res.json(resData);
    } else {
      return res.status(201).send('');
    }
  } catch (error) {
    console.log(error);
  }
};

const recupListDossier = async (req, res) => {
  try {
    const { userId, compteId } = req.body;
    const list = await dossier.findAll({
      where: {
        id_user: userId,
        id_compte: compteId
      },
      order: [['dossier', 'ASC']]
    });

    if (list) {
      const resData = {
        dossierList: list
      };

      return res.json(resData);
    } else {
      return res.status(201).send('');
    }
  } catch (error) {
    console.log(error);
  }
};

const createModel = async (req, res) => {
  try {
    const { model, compteId, id_dossier, model_name } = req.body;

    if (model === 'modeleLibre') {

      const testSiExisteNom = await modelePlanComptable.findOne({
        where: { nom: model_name }
      });

      if (testSiExisteNom) {
        res.send("Ce nom de modèle existe déjà. Veuillez spécifier un autre");
      } else {
        const NewModel = await modelePlanComptable.create({
          id_compte: compteId,
          nom: model_name,
          pardefault: false
        });

        if (NewModel) {
          res.send("Le modèle a été créé avec succès");
        } else {
          res.send("Un prblème est survenue lors de la création du modèle");
        }
      }
    } else {
      //récupérer le plan comptable associé au dossier sélectionné
      const PC = await dossierPlanComptable.findAll({
        where: { id_dossier: id_dossier }
      });

      const testSiExisteNom = await modelePlanComptable.findOne({
        where: { nom: model_name }
      });

      if (testSiExisteNom) {
        res.send("Ce nom de modèle existe déjà. Veuillez spécifier un autre");
      } else {
        const NewModel = await modelePlanComptable.create({
          id_compte: compteId,
          nom: model_name,
          pardefault: false
        });

        //copier le modèle séléctionner
        const copy = PC.map(async (item) => {
          const idNewItem = await modeleplancomptabledetail.create({
            id_compte: item.id_compte,
            id_modeleplancomptable: NewModel.id,
            compte: item.compte,
            libelle: item.libelle,
            nature: item.nature,
            baseaux: item.baseaux,
            cptcharge: item.cptcharge,
            cpttva: item.cpttva,
            nif: item.nif,
            statistique: item.statistique,
            adresse: item.adresse,
            motcle: item.motcle,
            baseaux_id: item.baseaux_id,
          });

          //copie détails compte de charge si existe
          if (item.cptcharge >= 1) {
            const detail = modeleplancomptabledetailcptchg.findAll({
              where: {
                id_compte: compteId,
                id_detail: item.id
              }
            });

            if (detail) {
              const copy = detail.map(async (detch) => {
                const detChg = await modeleplancomptabledetailcptchg.create({
                  id_compte: detch.id_compte,
                  id_modeleplancomptable: detch.id_modeleplancomptable,
                  id_detail: item.id,
                  compte: detch.compte,
                  libelle: detch.libelle,
                });
              });
            }
          }

          //copy détail compte de tva si existe
          if (item.cpttva >= 1) {
            const detailtva = modeleplancomptabledetailcpttva.findAll({
              where: {
                id_compte: compteId,
                id_detail: item.id
              }
            });

            if (detailtva) {
              const copy = detailtva.map(async (dettva) => {
                const det = await modeleplancomptabledetailcpttva.create({
                  id_compte: dettva.id_compte,
                  id_modeleplancomptable: dettva.id_modeleplancomptable,
                  id_detail: item.id,
                  compte: dettva.compte,
                  libelle: dettva.libelle,
                });
              });
            }
          }

          return idNewItem;
        });

        if (NewModel && copy) {
          res.send("Le modèle a été créé avec succès");
        } else {
          res.send("Un prblème est survenue lors de la création du modèle");
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteModel = async (req, res) => {
  try {
    const { rowId } = req.body;

    //supprimer dans un premier les détails comptes chg et tva
    const pcDetail = await modeleplancomptabledetail.findAll({
      where: { id_modeleplancomptable: rowId }
    });

    const deleteDetailChgEtTVA = pcDetail.map(async (pc) => {
      if (pc.cptcharge >= 1) {
        await modeleplancomptabledetailcptchg.destroy({
          where: { id_detail: pc.id }
        });
      }

      if (pc.cpttva >= 1) {
        await modeleplancomptabledetailcpttva.destroy({
          where: { id_detail: pc.id }
        });
      }
    });

    //Supprimer les pcDetail
    const DeleteDetails = await modeleplancomptabledetail.destroy({
      where: { id_modeleplancomptable: rowId }
    });

    //Supprimer le modèle dans la table liste de modèles
    const DeleteModel = await modelePlanComptable.destroy({
      where: { id: rowId }
    });

    if (DeleteModel) return res.send("Le modèle a été supprimé avec succès");
    res.send("Un prblème est survenue lors de la suppression du modèle");

  } catch (error) {
    console.log(error);
  }
}

const detailModel = async (req, res) => {
  try {
    const { rowId } = req.body;

    const pcDetail = await modeleplancomptabledetail.findAll({
      where:
      {
        id_modeleplancomptable: rowId
      },
      include: [
        {
          model: modeleplancomptabledetail,
          as: 'BaseAux',
          attributes: [
            ['compte', 'comptecentr']
          ],
          required: false,
          where: {
            id_modeleplancomptable: rowId
          }
        },
      ],
      raw: true,
      order: [['compte', 'ASC']]
    });

    if (pcDetail) {
      const resData = {
        modelDetail: pcDetail
      };
      res.json(resData);
    } else {
      const resData = {
        modelDetail: []
      };
      res.json(resData);
    }

  } catch (error) {
    console.log(error);
  }
}

const AddCptTodetailModel = async (req, res) => {
  try {
    const {
      action,
      itemId,
      idCompte,
      idModele,
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

    if (action === "new") {
      let resData = {
        state: false,
        msg: ''
      };

      if (typeTier === "sans-nif") {
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if (nature === 'General' || nature === 'Collectif') {
          baseauxiliaire = compte;

          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              compte: compte
            }
          });

          if (findedID) {
            baseaux_id = findedID.id;
          }
        } else {
          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id: baseCptCollectif
            }
          });

          baseaux_id = baseCptCollectif;

          if (findedID) {
            baseauxiliaire = findedID.compte;
          }
        }

        let cptChNb = 0;
        if (listeCptChg.length > 0) {
          cptChNb = listeCptChg.length;
        }

        let cptTvaNb = 0;
        if (listeCptTva.length > 0) {
          cptTvaNb = listeCptTva.length;
        }

        const NewCptAdded = await modeleplancomptabledetail.create({
          id_compte: idCompte,
          id_modeleplancomptable: idModele,
          compte: compte,
          libelle: libelle,
          nature: nature,
          baseaux: baseauxiliaire,
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
        if (listeCptChg.length > 0) {
          listeCptChg.map(async (item) => {
            const saveCptCh = await modeleplancomptabledetailcptchg.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }

        if (listeCptTva.length > 0) {
          listeCptTva.map(async (item) => {
            const saveCptTva = await modeleplancomptabledetailcpttva.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
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

      if (typeTier === "avec-nif") {
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if (nature === 'General' || nature === 'Collectif') {
          baseauxiliaire = compte;

          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              compte: compte
            }
          });

          if (findedID) {
            baseaux_id = findedID.id;
          }
        } else {
          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id: baseCptCollectif
            }
          });

          baseaux_id = baseCptCollectif;

          if (findedID) {
            baseauxiliaire = findedID.compte;
          }
        }

        let cptChNb = 0;
        if (listeCptChg.length > 0) {
          cptChNb = listeCptChg.length;
        }

        let cptTvaNb = 0;
        if (listeCptTva.length > 0) {
          cptTvaNb = listeCptTva.length;
        }

        const NewCptAdded = await modeleplancomptabledetail.create({
          id_compte: idCompte,
          id_modeleplancomptable: idModele,
          compte: compte,
          libelle: libelle,
          nature: nature,
          baseaux: baseauxiliaire,
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
        if (listeCptChg.length > 0) {
          listeCptChg.map(async (item) => {
            const saveCptCh = await modeleplancomptabledetailcptchg.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }

        if (listeCptTva.length > 0) {
          listeCptTva.map(async (item) => {
            const saveCptTva = await modeleplancomptabledetailcpttva.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
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

      if (typeTier === "etranger") {
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if (nature === 'General' || nature === 'Collectif') {
          baseauxiliaire = compte;

          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              compte: compte
            }
          });

          if (findedID) {
            baseaux_id = findedID.id;
          }
        } else {
          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id: baseCptCollectif
            }
          });

          baseaux_id = baseCptCollectif;

          if (findedID) {
            baseauxiliaire = findedID.compte;
          }
        }

        let cptChNb = 0;
        if (listeCptChg.length > 0) {
          cptChNb = listeCptChg.length;
        }

        let cptTvaNb = 0;
        if (listeCptTva.length > 0) {
          cptTvaNb = listeCptTva.length;
        }

        const NewCptAdded = await modeleplancomptabledetail.create({
          id_compte: idCompte,
          id_modeleplancomptable: idModele,
          compte: compte,
          libelle: libelle,
          nature: nature,
          baseaux: baseauxiliaire,
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
        if (listeCptChg.length > 0) {
          listeCptChg.map(async (item) => {
            const saveCptCh = await modeleplancomptabledetailcptchg.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }

        if (listeCptTva.length > 0) {
          listeCptTva.map(async (item) => {
            const saveCptTva = await modeleplancomptabledetailcpttva.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
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

      if (typeTier === "general") {
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if (nature === 'General' || nature === 'Collectif') {
          baseauxiliaire = compte;

          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              compte: compte
            }
          });

          if (findedID) {
            baseaux_id = findedID.id;
          }
        } else {
          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id: baseCptCollectif
            }
          });

          baseaux_id = baseCptCollectif;

          if (findedID) {
            baseauxiliaire = findedID.compte;
          }
        }

        let cptChNb = 0;
        if (listeCptChg.length > 0) {
          cptChNb = listeCptChg.length;
        }

        let cptTvaNb = 0;
        if (listeCptTva.length > 0) {
          cptTvaNb = listeCptTva.length;
        }

        const NewCptAdded = await modeleplancomptabledetail.create({
          id_compte: idCompte,
          id_modeleplancomptable: idModele,
          compte: compte,
          libelle: libelle,
          nature: nature,
          baseaux: baseauxiliaire,
          cptcharge: cptChNb,
          cpttva: cptTvaNb,

          typetier: typeTier,
          pays: 'Madagascar',
          motcle: motcle,
          baseaux_id: baseaux_id
        });

        //Enregistrer les compte de charges et TVA associés au compte
        if (listeCptChg.length > 0) {
          listeCptChg.map(async (item) => {
            const saveCptCh = await modeleplancomptabledetailcptchg.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              id_detail: NewCptAdded.id,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }

        if (listeCptTva.length > 0) {
          listeCptTva.map(async (item) => {
            const saveCptTva = await modeleplancomptabledetailcpttva.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
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

    } else {
      let resData = {
        state: false,
        msg: ''
      };

      if (typeTier === "sans-nif") {
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if (nature === 'General' || nature === 'Collectif') {
          baseauxiliaire = compte;

          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              compte: compte
            }
          });

          if (findedID) {
            baseaux_id = findedID.id;
          }
        } else {
          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id: baseCptCollectif
            }
          });

          baseaux_id = baseCptCollectif;

          if (findedID) {
            baseauxiliaire = findedID.compte;
          }
        }

        let cptChNb = 0;
        if (listeCptChg.length > 0) {
          cptChNb = listeCptChg.length;
        }

        let cptTvaNb = 0;
        if (listeCptTva.length > 0) {
          cptTvaNb = listeCptTva.length;
        }

        const NewCptAdded = await modeleplancomptabledetail.update(
          {
            id_compte: idCompte,
            id_modeleplancomptable: idModele,
            compte: compte,
            libelle: libelle,
            nature: nature,
            baseaux: baseauxiliaire,
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
        if (listeCptChg.length > 0) {
          listeCptChg.map(async (item) => {
            //supprimer l'ancienne ligne
            await modeleplancomptabledetailcptchg.destroy({ where: { id: item.id } });

            const saveCptCh = await modeleplancomptabledetailcptchg.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              id_detail: itemId,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }

        if (listeCptTva.length > 0) {
          listeCptTva.map(async (item) => {
            //supprimer l'ancienne ligne
            await modeleplancomptabledetailcpttva.destroy({ where: { id: item.id } });

            const saveCptTva = await modeleplancomptabledetailcpttva.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
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

      if (typeTier === "avec-nif") {
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if (nature === 'General' || nature === 'Collectif') {
          baseauxiliaire = compte;

          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              compte: compte
            }
          });

          if (findedID) {
            baseaux_id = findedID.id;
          }
        } else {
          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id: baseCptCollectif
            }
          });

          baseaux_id = baseCptCollectif;

          if (findedID) {
            baseauxiliaire = findedID.compte;
          }
        }

        let cptChNb = 0;
        if (listeCptChg.length > 0) {
          cptChNb = listeCptChg.length;
        }

        let cptTvaNb = 0;
        if (listeCptTva.length > 0) {
          cptTvaNb = listeCptTva.length;
        }

        const NewCptAdded = await modeleplancomptabledetail.update(
          {
            id_compte: idCompte,
            id_modeleplancomptable: idModele,
            compte: compte,
            libelle: libelle,
            nature: nature,
            baseaux: baseauxiliaire,
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
            where: { id: itemId }
          }
        );

        //Enregistrer les compte de charges et TVA associés au compte
        if (listeCptChg.length > 0) {
          listeCptChg.map(async (item) => {
            //supprimer l'ancienne ligne
            await modeleplancomptabledetailcptchg.destroy({ where: { id: item.id } });

            const saveCptCh = await modeleplancomptabledetailcptchg.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              id_detail: itemId,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }

        if (listeCptTva.length > 0) {
          listeCptTva.map(async (item) => {
            //supprimer l'ancienne ligne
            await modeleplancomptabledetailcpttva.destroy({ where: { id: item.id } });

            const saveCptTva = await modeleplancomptabledetailcpttva.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
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

      if (typeTier === "etranger") {
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if (nature === 'General' || nature === 'Collectif') {
          baseauxiliaire = compte;

          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              compte: compte
            }
          });

          if (findedID) {
            baseaux_id = findedID.id;
          }
        } else {
          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id: baseCptCollectif
            }
          });

          baseaux_id = baseCptCollectif;

          if (findedID) {
            baseauxiliaire = findedID.compte;
          }
        }

        let cptChNb = 0;
        if (listeCptChg.length > 0) {
          cptChNb = listeCptChg.length;
        }

        let cptTvaNb = 0;
        if (listeCptTva.length > 0) {
          cptTvaNb = listeCptTva.length;
        }

        const NewCptAdded = await modeleplancomptabledetail.update(
          {
            id_compte: idCompte,
            id_modeleplancomptable: idModele,
            compte: compte,
            libelle: libelle,
            nature: nature,
            baseaux: baseauxiliaire,
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
            where: { id: itemId }
          }
        );

        //Enregistrer les compte de charges et TVA associés au compte
        if (listeCptChg.length > 0) {
          listeCptChg.map(async (item) => {
            //supprimer l'ancienne ligne
            await modeleplancomptabledetailcptchg.destroy({ where: { id: item.id } });

            const saveCptCh = await modeleplancomptabledetailcptchg.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              id_detail: itemId,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }

        if (listeCptTva.length > 0) {
          listeCptTva.map(async (item) => {
            //supprimer l'ancienne ligne
            await modeleplancomptabledetailcpttva.destroy({ where: { id: item.id } });

            const saveCptTva = await modeleplancomptabledetailcpttva.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
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

      if (typeTier === "general") {
        let baseauxiliaire = '';
        let baseaux_id = 0;

        if (nature === 'General' || nature === 'Collectif') {
          baseauxiliaire = compte;

          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              compte: compte
            }
          });

          if (findedID) {
            baseaux_id = findedID.id;
          }
        } else {
          const findedID = await modeleplancomptabledetail.findOne({
            where:
            {
              id: baseCptCollectif
            }
          });

          baseaux_id = baseCptCollectif;

          if (findedID) {
            baseauxiliaire = findedID.compte;
          }
        }

        let cptChNb = 0;
        if (listeCptChg.length > 0) {
          cptChNb = listeCptChg.length;
        }

        let cptTvaNb = 0;
        if (listeCptTva.length > 0) {
          cptTvaNb = listeCptTva.length;
        }

        const NewCptAdded = await modeleplancomptabledetail.update(
          {
            id_compte: idCompte,
            id_modeleplancomptable: idModele,
            compte: compte,
            libelle: libelle,
            nature: nature,
            baseaux: baseauxiliaire,
            cptcharge: cptChNb,
            cpttva: cptTvaNb,

            typetier: typeTier,
            pays: 'Madagascar',
            motcle: motcle,
            baseaux_id: baseaux_id
          },
          {
            where: { id: itemId }
          }
        );

        //Enregistrer les compte de charges et TVA associés au compte
        if (listeCptChg.length > 0) {
          listeCptChg.map(async (item) => {
            //supprimer l'ancienne ligne
            await modeleplancomptabledetailcptchg.destroy({ where: { id: item.id } });

            const saveCptCh = await modeleplancomptabledetailcptchg.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
              id_detail: itemId,
              compte: item.compte,
              libelle: item.libelle,
              id_comptecompta: item.idCpt
            });
          });
        }

        if (listeCptTva.length > 0) {
          listeCptTva.map(async (item) => {
            //supprimer l'ancienne ligne
            await modeleplancomptabledetailcpttva.destroy({ where: { id: item.id } });

            const saveCptTva = await modeleplancomptabledetailcpttva.create({
              id_compte: idCompte,
              id_modeleplancomptable: idModele,
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
  } catch (error) {
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
    const listeDetailModelCptChgData = await modeleplancomptabledetailcptchg.findAll({
      where: {
        id_detail: itemId
      },
      order: [['compte', 'ASC']]
    });

    const listeDetailModelCptTvaData = await modeleplancomptabledetailcpttva.findAll({
      where: {
        id_detail: itemId
      },
      order: [['compte', 'ASC']]
    });

    if (listeDetailModelCptChgData || listeDetailModelCptTvaData) {

      resData.state = true;
      resData.msg = '';
      resData.detailChg = listeDetailModelCptChgData;
      resData.detailTva = listeDetailModelCptTvaData;

    } else {
      resData.state = false;
      resData.msg = 'Une erreur est survenue lors de la récupération des données';
    }
    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
};

const deleteItemPc = async (req, res) => {
  try {
    let resData = {
      state: false,
      msg: 'Une erreur est survenue lors du traitement.',
      stateUndeletableCpt: false,
      msgUndeletableCpt: ''
    }

    let msgErrorDelete = '';
    const { listId, modelId, compteId } = req.body;

    if (listId.length >= 1) {
      for (let i = 0; i < listId.length; i++) {
        //tester si le compte est lié à un compte auxiliaire
        const infosCpt = await modeleplancomptabledetail.findOne({
          where: { id: listId[i] }
        });

        let cpt = '';
        if (infosCpt) {
          cpt = infosCpt.compte;
        }

        const cptInUse = await modeleplancomptabledetail.findAll({
          where: {
            baseaux: cpt,
            id_compte: compteId,
            id_modeleplancomptable: modelId
          }
        });

        if (cptInUse.length > 1) {
          resData.stateUndeletableCpt = true;
          if (msgErrorDelete === '') {
            msgErrorDelete = `Impossible de supprimer les comptes suivants car ils sont utilisés comme base des comptes auxiliaires: ${cpt}`;
          } else {
            msgErrorDelete = `${msgErrorDelete}, ${cpt}`;
          }
        } else {
          await modeleplancomptabledetail.destroy({ where: { id: listId[i] } });

          //supprimer si la ligne possède des comptes de charges ou TVA associés
          await modeleplancomptabledetailcptchg.destroy({ where: { id_detail: listId[i] } });
          await modeleplancomptabledetailcpttva.destroy({ where: { id_detail: listId[i] } });
        }
      }
      resData.state = true;
      resData.msg = "Les comptes séléctionés ont été supprimés avec succès.";
    }

    resData.msgUndeletableCpt = msgErrorDelete;
    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  recupListModelePlanComptable,
  recupListDossier,
  createModel,
  deleteModel,
  detailModel,
  AddCptTodetailModel,
  keepListCptChgTvaAssoc,
  deleteItemPc
};