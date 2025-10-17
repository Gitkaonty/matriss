//importing modules
const bcrypt = require("bcrypt");
const db = require("../../Models");

const dossier = db.dossiers;
const dossierassocies = db.dossierassocies;
const dossierfiliales = db.dossierfiliales;
const modeleplancomptabledetail = db.modeleplancomptabledetail;
const dossierplancomptable = db.dossierplancomptable;
const modeleplancomptabledetailcptchg = db.modeleplancomptabledetailcptchg;
const modeleplancomptabledetailcpttva = db.modeleplancomptabledetailcpttva;
const dossierpcdetailcptchg = db.dossierpcdetailcptchg;
const dossierpcdetailcpttva = db.dossierpcdetailcpttva;
const dombancaires = db.dombancaires;
const pays = db.pays;

dombancaires.belongsTo(pays, { as: 'tablepays', foreignKey: 'pays', targetKey: 'code' });

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

const recupListDossier = async (req, res) => {
  try {
    const compteId = req.params.compteId;

    let resData = {
      state: false,
      msg: '',
      fileList: []
    }

    const list = await dossier.findAll({
      where: {
        id_compte: compteId
      }
    });

    if (list) {
      resData.state = true;
      resData.fileList = list;
    } else {
      resData.state = false;
      resData.msg = 'une erreur est survenue lors du traitement.';
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
};

const createNewFile = async (req, res) => {
  try {
    let resData = {
      state: false,
      msg: '',
    }

    const {
      action,
      itemId,
      idCompte,
      nomdossier,
      raisonsociale,
      denomination,
      nif,
      stat,
      rcs,
      responsable,
      expertcomptable,
      cac,
      forme,
      activite,
      detailsactivite,
      adresse,
      email,
      telephone,
      plancomptable,
      longueurcptstd,
      longueurcptaux,
      autocompletion,
      avecanalytique,
      tauxir,
      assujettitva,
      montantcapital,
      nbrpart,
      valeurpart,
      listeAssocies,
      listeFiliales,
      centrefisc,
      listeDomBank,
      province,
      region,
      district,
      commune
    } = req.body;

    if (action === 'new') {
      const newFile = await dossier.create({
        id_compte: idCompte,
        dossier: nomdossier,
        nif: nif,
        stat: stat,
        responsable: responsable,
        expertcomptable: expertcomptable,
        cac: cac,
        raisonsociale: raisonsociale,
        denomination: denomination,
        formejuridique: forme,
        activite: activite,
        detailactivite: detailsactivite,
        adresse: adresse,
        email: email,
        telephone: telephone,
        longcomptestd: longueurcptstd,
        longcompteaux: longueurcptaux,
        autocompletion: autocompletion,
        avecanalytique: avecanalytique,
        tauxir: tauxir || 0,
        assujettitva: assujettitva,
        capital: montantcapital || 0,
        nbrpart: nbrpart,
        valeurpart: valeurpart,
        id_plancomptable: plancomptable,
        rcs: rcs,
        centrefisc: centrefisc,
        province: province,
        region: region,
        district: district,
        commune: commune,
          });

      //copie la liste des associés
      if (newFile.id) {
        if (listeAssocies.length > 0) {
          for (const item of listeAssocies) {
            await dossierassocies.create({
              id_dossier: newFile.id,
              id_compte: idCompte,
              type: item.type,
              nom: item.nom,
              adresse: item.adresse,
              dateentree: (item.dateentree && item.dateentree !== '') ? item.dateentree : null,
              datesortie: (item.datesortie && item.datesortie !== '') ? item.datesortie : null,
              nbrpart: item.nbrpart,
              enactivite: item.enactivite
            });
          };
        }
      }

      //copie la liste des filiales
      if (newFile.id) {
        if (listeFiliales.length > 0) {
          for (const item of listeFiliales) {
            await dossierfiliales.create({
              id_dossier: newFile.id,
              id_compte: idCompte,
              type: item.type,
              nom: item.nom,
              dateentree: item.dateentree,
              datesortie: item.datesortie,
              nbrpart: item.nbrpart,
              enactivite: item.enactivite
            });
          }
        }
      }

      //copie la liste des domiciliations bancaires
      if (newFile.id) {
        if (listeDomBank.length > 0) {
          for (const item of listeDomBank) {
            await dombancaires.create({
              id_dossier: newFile.id,
              id_compte: idCompte,
              banque: item.banque,
              numcompte: item.numcompte,
              devise: item.devise,
              pays: item.pays,
              enactivite: item.enactivite
            });
          }
        }
      }

      //copie du plan comptable
      const modelePc = await modeleplancomptabledetail.findAll({
        where: { id_modeleplancomptable: plancomptable }
      });

      if (modelePc.length > 0) {
        //console.log("🔁 Début de la copie du plan comptable. Total lignes :", modelePc.length);

        for (const [index, item] of modelePc.entries()) {
          try {
            // Sécurité : vérifie que les champs critiques existent
            if (!item.compte || typeof item.compte !== "string") {
              //console.log(`⚠️ Ligne ${index + 1} ignorée : champ 'compte' invalide →`, item.compte);
              continue;
            }

            if (!item.libelle) {
              //console.log(`⚠️ Ligne ${index + 1} ignorée : champ 'libelle' vide`);
              continue;
            }

            let compteFormated = '';
            let baseAux = '';

            // Formatage compte & baseaux selon les règles métier
            if (autocompletion) {
              if (item.nature === "Aux") {
                compteFormated = item.compte.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux);
                baseAux = item.baseaux?.toString().padEnd(longueurcptaux, "0").slice(0, longueurcptaux) || '';
              } else {
                compteFormated = item.compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
                baseAux = item.baseaux?.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
              }
            } else {
              if (item.nature !== "Aux") {
                compteFormated = item.compte.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd);
                baseAux = item.baseaux?.toString().padEnd(longueurcptstd, "0").slice(0, longueurcptstd) || '';
              } else {
                compteFormated = item.compte;
                baseAux = item.baseaux;
              }
            }

            // Insertion sécurisée
            const newCptEntry = await dossierplancomptable.create({
              id_compte: idCompte,
              id_dossier: newFile.id,
              compte: compteFormated,
              libelle: item.libelle,
              nature: item.nature,
              baseaux: baseAux,
              cptcharge: item.cptcharge,
              typetier: item.typetier,
              cpttva: item.cpttva,
              nif: item.nif,
              statistique: item.statistique,
              adresse: item.adresse,
              motcle: item.motcle,
              cin: item.cin,
              datecin: item.datecin,
              autrepieceid: item.autrepieceid,
              refpieceid: item.refpieceid,
              adressesansnif: item.adressesansnif,
              nifrepresentant: item.nifrepresentant,
              adresseetranger: item.adresseetranger,
              pays: item.pays,
              // baseaux_id: à gérer plus tard
            });

            //console.log(`✅ [${index + 1}/${modelePc.length}] Insertion OK pour le compte :`, compteFormated);

            //copier les comptes de charges associés au compte s'il en existe 
            if (item.cptcharge) {
              const listCptCh = await modeleplancomptabledetailcptchg.findAll({
                where:
                {
                  id_compte: idCompte,
                  id_modeleplancomptable: plancomptable,
                  id_detail: item.id
                }
              });

              if (listCptCh.length > 0) {
                for (const [index, item] of listCptCh.entries()) {
                  await dossierpcdetailcptchg.create({
                    id_compte: idCompte,
                    id_dossier: newFile.id,
                    id_detail: newCptEntry.id,
                    compte: item.compte,
                    libelle: item.libelle,
                    libelle: item.libelle,
                    id_comptecompta: item.id_comptecompta
                  });
                }
              }
            }

            //copier les comptes de TVA associés au compte s'il en existe
            if (item.cpttva) {
              const listCptTva = await modeleplancomptabledetailcpttva.findAll({
                where:
                {
                  id_compte: idCompte,
                  id_modeleplancomptable: plancomptable,
                  id_detail: item.id
                }
              });

              if (listCptTva.length > 0) {
                for (const [index, item] of listCptTva.entries()) {
                  await dossierpcdetailcpttva.create({
                    id_compte: idCompte,
                    id_dossier: newFile.id,
                    id_detail: newCptEntry.id,
                    compte: item.compte,
                    libelle: item.libelle,
                    id_comptecompta: item.id_comptecompta
                  });
                }
              }
            }

          } catch (err) {
            //console.log(`❌ [${index + 1}] Erreur insertion compte : ${item.compte}`);
            console.log("💥 Message :", err.message);
          }
        }

        //console.log("🏁 Fin de la boucle de copie du plan comptable");
      }


      if (newFile) {
        updatebaseAuxID(idCompte, newFile.id, plancomptable);
        resData.state = true;
        resData.msg = 'Création du nouveau dossier terminée avec succès';
      } else {
        resData.state = false;
        resData.msg = 'Une erreur est survenue lors de la création du nouveau dossier';
      }

      return res.json(resData);
    }
  } catch (error) {
    console.log(error);
  }
}

const updatebaseAuxID = async (idCompte, id_dossier, id_modelePC) => {
  try {
    const importedModel = await dossierplancomptable.findAll({
      where:
      {
        id_compte: idCompte,
        id_dossier: id_dossier
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

        const baseauxItem = importedModel.find(cpt =>
          cpt.id_compte === String(idCompte) &&
          cpt.id_dossier === String(id_dossier) &&
          cpt.compte === item.baseaux
        );

        if (baseauxItem) {
          await dossierplancomptable.update(
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

    //mettre à jour les ID des compte de charge et TVA associé
    const listCptCh = await dossierpcdetailcptchg.findAll({
      where:
      {
        id_compte: idCompte,
        id_dossier: id_dossier
      }
    });

    if (listCptCh.length > 0) {
      for (const [index, item] of listCptCh.entries()) {
        const dataInfosIDmodelePC = await modeleplancomptabledetail.findOne({
          where:
          {
            id: item.id_comptecompta,
            id_modeleplancomptable: id_modelePC,
          }
        });

        if (dataInfosIDmodelePC) {
          const dataInfosID = await dossierplancomptable.findOne({
            where:
            {
              id_compte: String(idCompte),
              id_dossier: String(id_dossier),
              compte: dataInfosIDmodelePC.compte
            }
          });

          if (dataInfosID) {
            await dossierpcdetailcptchg.update(
              {
                compte: dataInfosID.compte,
                libelle: dataInfosID.libelle,
                id_comptecompta: dataInfosID.id
              },
              {
                where: { id: item.id }
              }
            );
          }
        }
      }
    }

    const listCptTva = await dossierpcdetailcpttva.findAll({
      where:
      {
        id_compte: idCompte,
        id_dossier: id_dossier
      }
    });

    if (listCptTva.length > 0) {
      for (const [index, item] of listCptTva.entries()) {
        const dataInfosIDmodelePC = await modeleplancomptabledetail.findOne({
          where:
          {
            id: item.id_comptecompta,
            id_modeleplancomptable: id_modelePC,
          }
        });

        if (dataInfosIDmodelePC) {
          const dataInfosID = await dossierplancomptable.findOne({
            where:
            {
              id_compte: idCompte,
              id_dossier: id_dossier,
              compte: dataInfosIDmodelePC.compte
            }
          });

          if (dataInfosID) {
            await modeleplancomptabledetailcpttva.update(
              {
                compte: dataInfosID.compte,
                libelle: dataInfosID.libelle,
                id_comptecompta: dataInfosID.id
              },
              {
                where: { id: item.id }
              }
            );
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

const deleteCreatedFile = async (req, res) => {
  try {
    const { id_dossier } = req.body;
    let resData = {
      state: false,
      msg: '',
    }

    const deleteState = await dossier.destroy({
      where: { id: id_dossier }
    });

    await dossierplancomptable.destroy({
      where: { id_dossier: id_dossier }
    });

    if (deleteState) {
      resData.state = true;
      resData.msg = 'Suppression du dossier effectuée avec succès';
    } else {
      resData.state = false;
      resData.msg = 'Une erreur est survenue lors de la suppression du dossier';
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const informationsFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    let resData = {
      state: false,
      msg: '',
      fileInfos: [],
      associe: [],
      domBank: [],
    }

    if (fileId > 0) {
      const list = await dossier.findAll({
        where: {
          id: fileId
        }
      });

      const listAssocie = await dossierassocies.findAll({
        where:
        {
          id_dossier: fileId,
          enactivite: true
        }
      });

      const listDomBank = await dombancaires.findAll({
        where:
        {
          id_dossier: fileId,
          enactivite: true
        },
        include: [
          {
            model: pays,
            as: 'tablepays',
            attributes: [
              ['nompays', 'nompays']
            ],
            required: true,
          },
        ],
        raw: true,
      });

      if (list.length > 0) {
        resData.state = true;
        resData.fileInfos = list;
        resData.associe = listAssocie;
        resData.domBank = listDomBank;
      } else {
        resData.state = false;
        resData.msg = 'une erreur est survenue lors du traitement.';
      }
    } else {
      resData.state = false;
      resData.msg = "ce dossier n'existe pas.";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  } finally {
    // Add finally block to ensure cleanup
  }
}

const updateCentrefisc = async (req, res) => {
  try {
    const id = req.params.id || req.body?.id_dossier;
    const { centrefisc } = req.body || {};
    const allowed = ['DGE', 'CFISC'];

    if (!id) {
      return res.status(400).json({ state: false, msg: 'id du dossier manquant' });
    }
    if (!allowed.includes(centrefisc)) {
      return res.status(400).json({ state: false, msg: "centrefisc invalide: doit être 'DGE' ou 'CFISC'" });
    }

    const updateState = await dossier.update({ centrefisc }, { where: { id } });

    if (updateState[0] > 0) {
      return res.json({ state: true, msg: 'Mise à jour du centre fiscal effectuée avec succès', centrefisc });
    }
    return res.status(404).json({ state: false, msg: 'Dossier introuvable' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur' });
  }
}

module.exports = {
  recupListDossier,
  createNewFile,
  deleteCreatedFile,
  informationsFile,
  updateCentrefisc,
};