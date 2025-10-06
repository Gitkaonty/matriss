const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = Sequelize;

const listecodetvas = db.listecodetvas;
const paramtvas = db.paramtvas;
const dossierplancomptables = db.dossierplancomptable;
const Journals = db.journals;
const codejournals = db.codejournals;
const tva_annexes = db.etatsTvaAnnexes;

// Simple pluralize helper used for messages
function pluralize(count, singular) {
  if (typeof count !== 'number') return singular;
  return count > 1 ? `${singular}s` : singular;
}

paramtvas.belongsTo(dossierplancomptables, { foreignKey: 'id_cptcompta' });
dossierplancomptables.hasMany(paramtvas, { foreignKey: 'id_cptcompta' });

paramtvas.belongsTo(listecodetvas, { foreignKey: 'type' });
listecodetvas.hasMany(paramtvas, { foreignKey: 'type' });

const getListeCodeTva = async (req, res) => {
  try {

    let resData = {
      state: false,
      msg: 'une erreur est survenue lors du traitement.',
      list: []
    }

    const listeCodeTva = await listecodetvas.findAll({
      order: [['code', 'ASC']]
    });

    if (listeCodeTva) {
      resData.state = true;
      resData.list = listeCodeTva;
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const listeParamTva = async (req, res) => {
  try {
    const fileId = req.params.id;

    let resData = {
      state: false,
      msg: 'une erreur est survenue lors du traitement.',
      list: []
    }

    const listeParamTva = await paramtvas.findAll({
      where: {
        id_dossier: fileId
      },
      include: [
        {
          model: dossierplancomptables,
          attributes: [
            ['compte', 'compte'],
            ['libelle', 'libelle']
          ],
        },
        {
          model: listecodetvas,
          attributes: [
            ['code', 'code'],
            ['libelle', 'libelle']
          ],
        }
      ],
      raw: true
      //order: [['dossierplancomptable.compte', 'ASC']]
    });

    if (listeParamTva) {
      resData.state = true;
      resData.list = listeParamTva;
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const paramTvaAdd = async (req, res) => {
  try {
    const { idCompte, idDossier, idCode, compte, libelle, code } = req.body;

    let resData = {
      state: false,
      msg: 'Une erreur est survenue au moment du traitement.',
    }

    const testIfExist = await paramtvas.findAll({
      where: { id: idCode, id_dossier: idDossier }
    });

    if (testIfExist.length === 0) {
      const addCode = await paramtvas.create({
        id_compte: idCompte,
        id_dossier: idDossier,
        id_cptcompta: compte,
        type: code,
      });

      if (addCode) {
        resData.state = true;
        resData.msg = "Paramétrage tva sauvegardé avec succès.";
      } else {
        resData.state = false;
        resData.msg = "Une erreur est survenue au moment du traitement des données";
      }
    } else {
      const ModifyCode = await paramtvas.update(
        {
          id_compte: idCompte,
          id_dossier: idDossier,
          id_cptcompta: compte,
          type: code,
        },
        {
          where: { id: idCode }
        }
      );

      if (ModifyCode) {
        resData.state = true;
        resData.msg = "Modification effectuée avec succès.";
      } else {
        resData.state = false;
        resData.msg = "Une erreur est survenue au moment du traitement des données";
      }
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const paramTvaDelete = async (req, res) => {
  try {
    const { fileId, compteId, idToDelete } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    const deletedParamTva = await paramtvas.destroy({
      where: {
        id: idToDelete,
        id_dossier: fileId,
        id_compte: compteId
      }
    });

    if (deletedParamTva) {
      resData.state = true;
      resData.msg = "Paramétrage tva supprimé avec succès.";
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données.";
    }

    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

// GET /paramTva/journals/byCompte
// Query: id_numcpt, id_dossier, id_exercice, mois, annee
async function listJournalsByCompte(req, res) {
  try {
    const { id_numcpt, id_dossier, id_exercice, mois, annee } = req.query;
    const where = {};
    if (id_numcpt) where.id_numcpt = id_numcpt;
    if (id_dossier) where.id_dossier = id_dossier;
    if (id_exercice) where.id_exercice = id_exercice;
    if (mois) where.decltvamois = Number(mois);
    if (annee) where.decltvaannee = Number(annee);

    const rows = await Journals.findAll({
      where,
      order: [['dateecriture', 'ASC'], ['id', 'ASC']],
      attributes: ['id','dateecriture','id_journal','piece','libelle','debit','credit','decltvamois','decltvaannee','decltva']
    });
    return res.json({ state: true, list: rows, msg: 'OK' });
  } catch (error) {
    console.log('[paramTva] listJournalsByCompte error', error);
    return res.json({ state: false, list: [], msg: 'Erreur serveur' });
  }
}

const createJournal = async (req, res) => {
  try {
    const { id_compte, id_numcpt, id_dossier, id_exercice, dateecriture, piece, libelle, debit, credit, mois, annee } = req.body;

    let resData = {
      state: false,
      msg: 'une erreur est survenue',
      fileInfos: []
    }

    if (!id_compte) {
      return res.json({ state: false, msg: 'Champ requis manquant: id_compte' });
    }

    const payload = {
      id_compte,
      id_numcpt: String(id_numcpt),
      id_dossier,
      id_exercice,
      dateecriture: dateecriture || new Date(),
      piece: piece ?? '',
      libelle: libelle ?? '',
      debit: Number(debit || 0),
      credit: Number(credit || 0),
      decltvamois: Number(mois || 0),
      decltvaannee: Number(annee || 0),
      decltva: typeof req.body?.decltva === 'boolean' ? req.body.decltva : false,
      devise: 'MGA',
    };

    const created = await Journals.create(payload);
    return res.json({ state: true, item: created, msg: 'Écriture ajoutée' });
  } catch (error) {
    console.log('[paramTva] createJournal error', error);
    return res.json({ state: false, msg: 'Erreur serveur lors de la création' });
  }
}

const ajoutMoisAnnee = async (req, res) => {
  try {
      const { selectedDetailRows, decltvamois, decltvaannee, id_compte, id_dossier, id_exercice } = req.body;
    console.log("aaaaaaaaa",req.body);
      if (!selectedDetailRows || !decltvamois || !decltvaannee) {
          return res.status(400).json({ state: false, message: 'Données manquantes' });
      }

      // Récupérer les journaux sélectionnés
      const journalData = await Journals.findAll({
          where: { id: selectedDetailRows,id_compte,id_dossier,id_exercice },
          include: [
              {
                  model: dossierplancomptables,
                  attributes: ['compte'],
                  required: true
              },
              {
                  model: codejournals,
                  attributes: ['code','type']
              }
          ],
          order: [['dateecriture', 'ASC']]
      });

      const mappedAllJournalsData = await Promise.all(
          journalData.map(async (journal) => {
              const { dossierplancomptables, codejournal, ...rest } = journal.toJSON();

              return {
                  ...rest,
                  compte: dossierplancomptables?.compte || null,
                  journalCode: codejournal?.code || null,
                  journalType: codejournal?.type || null,
              };
          })
      );
      console.log('[AJOUT][PAYLOAD]', { selected: selectedDetailRows, decltvamois, decltvaannee });
      console.table(mappedAllJournalsData.map(x => ({
        id: x.id, journalCode: x.journalCode, journalType: x.journalType, compte: x.compte
      })));

      // Partitionner: Banque (code 'BQ' ou type 'BANQUE') traité par ID; le reste via logique TVA par id_ecriture
      const bankIds = mappedAllJournalsData
        .filter(j => j.journalCode === 'BQ' || j.journalType === 'BANQUE')
        .map(j => j.id);
      const nonBankIds = mappedAllJournalsData
        .filter(j => !(j.journalCode === 'BQ' || j.journalType === 'BANQUE'))
        .map(j => j.id);

      let totalUpdated = 0;

      if (bankIds.length > 0) {
        const [cnt] = await Journals.update(
          { decltvamois: Number(decltvamois), decltvaannee: Number(decltvaannee), decltva: true },
          { where: { id: { [Op.in]: bankIds.map(Number) }, id_compte: Number(id_compte), id_dossier: Number(id_dossier), id_exercice: Number(id_exercice) } }
        );
        totalUpdated += Number(cnt || 0);
      }
      console.log('[AJOUT][PARTITION]', { bankIds, nonBankIds });
      const idEcritures = (nonBankIds.length > 0
        ? journalData.filter(j => nonBankIds.includes(j.id)).map(j => j.id_ecriture)
        : []);
      // console.log("yvgbhunj,kl;",idEcritures);
      console.log('[AJOUT][UPDATED]', { totalUpdated });
      // Récupérer toutes les écritures liées
      const allJournals = await Journals.findAll({
          where: { id_ecriture: idEcritures, id_compte, id_dossier, id_exercice },
          include: [
              {
                  model: dossierplancomptables,
                  attributes: ['compte'],
                  required: true
              },
              {
                  model: codejournals,
                  attributes: ['code','type']
              }
          ],
          order: [['dateecriture', 'ASC']]
      });

      
      // Mapper pour enrichir avec compte et code
      const mappedAllJournals = await Promise.all(
          allJournals.map(async (journal) => {
              const { dossierplancomptable, codejournal, ...rest } = journal.toJSON();

              return {
                  ...rest,
                  compte: dossierplancomptable?.compte || null,
                  journal: codejournal?.code || null,
              };
          })
      );
  // console.log(mappedAllJournals);
      const filteredJournals = mappedAllJournals.filter(
        j =>
          j.compte &&
          (
            j.compte.startsWith("4456") ||
            // j.compte.startsWith("4455") ||
            j.compte.startsWith("4456") ||
            j.compte.startsWith("4457") ||
            j.compte.startsWith("4458")
          )
      );
      

      const idEcrituresToUpdate = filteredJournals.map(j => j.id_ecriture);
      const uniqueIdEcrituresToUpdate = new Set(idEcrituresToUpdate);

      // Journaux sélectionnés qui NE commencent PAS par compteisi → à renvoyer
      const nonCompteIsiJournalsFiltered = mappedAllJournalsData.filter(
          j => !idEcrituresToUpdate.includes(j.id_ecriture)
      );

      // Si rien à modifier
      if (idEcrituresToUpdate.length === 0) {
          // Si aucune écriture TVA à maj mais on a peut-être déjà mis à jour des lignes banque
          return res.status(200).json({
              state: true,
              message: `${totalUpdated} ${pluralize(totalUpdated, "écriture")} ${pluralize(totalUpdated, "modifiée")} avec succès`,
              count: totalUpdated
          });
      }

      // Mise à jour des journaux qui commencent par compte TVA
      const [cntNonBank] = await Journals.update(
          { decltvamois, decltvaannee, decltva : true },
          { where: { id_ecriture: idEcrituresToUpdate, id_compte, id_dossier, id_exercice } }
      );

      totalUpdated += Number(cntNonBank || 0);

      // Réponse finale (cas non Banque)
      return res.status(200).json({
          message: `${totalUpdated} ${pluralize(totalUpdated, "écriture")} ${pluralize(totalUpdated, "modifiée")} avec succès`,
          state: true,
          count: totalUpdated
      });

  } catch (error) {
      console.error(error);
      return res.status(500).json({
          message: "Erreur serveur",
          state: false,
          error: error.message
      });
  }
};

const suppressionMoisAnnee = async (req, res) => {
  try {
      const { selectedDetailRows, decltva, decltvamois, decltvaannee, id_compte, id_dossier, id_exercice } = req.body;

      if (!selectedDetailRows || !decltvamois || !decltvaannee || !id_compte || !id_dossier || !id_exercice) {
          return res.status(400).json({ state: false, message: 'Ids non trouvé' });
      }

      const journalData = await Journals.findAll({
          where: {
              id: selectedDetailRows
          }
      })

      const idEcrituresToUpdate = journalData.map(j => j.id_ecriture);
      const uniqueIdEcrituresToUpdate = new Set(idEcrituresToUpdate);

      if (idEcrituresToUpdate.length === 0) {
          return res.status(200).json({ state: false, message: "Aucun journal à mettre à jour." });
      }

      await Journals.update(
          { decltva: false, decltvamois: 0, decltvaannee: 0 },
          { where: { id_ecriture: idEcrituresToUpdate } }
      );

      await tva_annexes.destroy({
          where: {
              id_compte: Number(id_compte),
              id_dossier: Number(id_dossier),
              id_exercice: Number(id_exercice),
              mois: Number(decltvamois),
              annee: Number(decltvaannee),
              id_ecriture: { [Op.in]: idEcrituresToUpdate }
          }
      })

      const count = uniqueIdEcrituresToUpdate.size;

      return res.status(200).json({
          message: `${count} ${pluralize(count, "écriture")} ${pluralize(count, "supprimée")} avec succès`,
          state: true
      });

  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
  }
};


// PUT /paramTva/journals/declflag
const updateJournalsDeclFlag = async (req, res) => {
  try {
    const { ids, flag } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({ state: false, msg: "Liste d'IDs manquante" });
    }
    const f = flag === true || flag === false ? flag : Boolean(flag);
    const [count] = await Journals.update(
      { decltva: f },
      { where: { id: ids } }
    );
    return res.json({ state: true, msg: `Mise à jour ${count} écriture(s)` });
  } catch (error) {
    console.log('[paramTva] updateJournalsDeclFlag error', error);
    return res.json({ state: false, msg: 'Erreur serveur lors de la mise à jour' });
  }
}

const getJournalsSelectionLigne = async (req, res) => {
  try {
      const { id_compte, id_dossier, id_exercice } = req.params;
      const { mois, annee } = req.query;

      if (!id_compte) {
          return res.status(400).json({ state: false, message: 'Id_compte non trouvé' });
      }
      if (!id_dossier) {
          return res.status(400).json({ state: false, message: 'Id_dossier non trouvé' });
      }
      if (!id_exercice) {
          return res.status(400).json({ state: false, message: 'Id_exercice non trouvé' });
      }

      const journalData = await Journals.findAll({
          where: {
              id_compte,
              id_dossier,
              id_exercice,
              [Op.or]: [
                  { decltva: false },
                  {
                      [Op.and]: [
                          { decltva: true },
                          { decltvamois: mois },
                          { decltvaannee: annee }
                      ]
                  }
              ]
          },
          include: [
              {
                  model: dossierplancomptables,
                  attributes: ['compte'],
                  required: true
              },
              {
                  model: codejournals,
                  attributes: ['code','type','nif','stat','adresse','libelle']
              }
          ],
          order: [['dateecriture', 'DESC']]
      });

      const mappedData = await Promise.all(
          journalData.map(async (journal) => {
              const { dossierplancomptable, codejournal, ...rest } = journal.toJSON();
              const compte_centralise = await dossierplancomptables.findByPk(journal.id_numcptcentralise);
              return {
                  ...rest,
                  compte: dossierplancomptable?.compte || null,
                  journal: codejournal?.code || null,
                  compte_cetralise: compte_centralise?.compte || null
              };
          }));

      return res.json({
          list: mappedData,
          state: true,
          message: "Récupéré avec succès"
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
  }
};

const getJournalsDeclTvaClasseTva = async (req, res) => {
  try {
      const { id_compte, id_dossier, id_exercice } = req.params;
      const { mois, annee} = req.query;

      if (!id_compte) {
          return res.status(400).json({ state: false, message: 'Id_compte non trouvé' });
      }
      if (!id_dossier) {
          return res.status(400).json({ state: false, message: 'Id_dossier non trouvé' });
      }
      if (!id_exercice) {
          return res.status(400).json({ state: false, message: 'Id_exercice non trouvé' });
      }
      if (!mois) {
          return res.status(400).json({ state: false, message: 'Mois manquante' });
      }
      if (!annee) {
          return res.status(400).json({ state: false, message: 'Année manquante' });
      }

      const journalData = await Journals.findAll({
          where: {
              id_compte,
              id_dossier,
              id_exercice,
              decltvamois: mois,
              decltvaannee: annee,
              decltva: true,
          },
          include: [
              {
                  model: dossierplancomptables,
                  attributes: ['compte'],
                  required: true,
                  where: {
                    [Op.or]: [
                      // { compte: { [Op.like]: '4455%' } },
                      { compte: { [Op.like]: '4456%' } },
                      { compte: { [Op.like]: '4457%' } },
                      { compte: { [Op.like]: '4458%' } }
                    ]
                  }
              },
              { model: codejournals, attributes: ['code'] }
          ],
          order: [['dateecriture', 'ASC']]
      });

      const mappedData = await Promise.all(
          journalData.map(async (journal) => {
              const { dossierplancomptable, codejournal, ...rest } = journal.toJSON();
              const compte_centralise = await dossierplancomptables.findByPk(journal.id_numcptcentralise);
              return {
                  ...rest,
                  compte: dossierplancomptable?.compte || null,
                  journal: codejournal?.code || null,
                  compte_cetralise: compte_centralise?.compte || null
              };
          }));

      return res.json({
          list: mappedData,
          state: true,
          message: "Récupéré avec succès"
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
  }
};

const recupPcClasseSix = async (req, res) => {
  try {
    const { id_dossier, id_compte } = req.params;
 
    const listepc = await dossierplancomptables.findAll({
      where: {
        id_dossier: id_dossier,
        id_compte: id_compte,
        libelle: { [Sequelize.Op.ne]: 'Collectif' },
        [Op.or]: [
          { compte: { [Op.like]: '4456%' } },
          { compte: { [Op.like]: '4457%' } },
        ]
      },
      include: [
        {
          model: dossierplancomptables,
          as: 'BaseAux',
          attributes: ['compte'],
          required: false,
          where: {
            id_dossier: id_dossier,
            id_compte: id_compte
          }
        }
      ],
      order: [['compte', 'ASC']],
      attributes: ['libelle', 'id']
    });
 
    const mappedListe = listepc.map(item => ({
      id: item.id,
      libelle: item.libelle,
      compte: item.BaseAux?.compte || null
    }));
 
    const uniqueListe = [];
    const seen = new Set();
 
    for (const item of mappedListe) {
      const key = `${item.libelle}-${item.compte}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueListe.push(item);
      }
    }
 
    const resData = {
      state: true,
      msg: "Donnée reçues avec succes !",
      liste: uniqueListe
    };
 
    if (listepc) {
      resData.state = true;
      resData.msg = "Donnée reçues avec succes !"
    } else {
      resData.state = false;
      resData.msg = "Une erreur est survenue au moment du traitement des données";
    }
 
    return res.json(resData);
  } catch (error) {
    console.log(error);
  }
}

const reinitializeTva = async (req, res) => {
  try {
      const { decltvamois, decltvaannee, id_compte, id_dossier, id_exercice } = req.body;

      if (!id_compte) {
          return res.status(400).json({ state: false, message: 'Id_compte non trouvé' });
      }
      if (!id_dossier) {
          return res.status(400).json({ state: false, message: 'Id_dossier non trouvé' });
      }
      if (!id_exercice) {
          return res.status(400).json({ state: false, message: 'Id_exercice non trouvé' });
      }

      if (!decltvamois || !decltvaannee) {
          return res.status(400).json({ state: false, message: 'Données manquantes' });
      }

      const journalsData = await Journals.findAll({
          where: {
              id_compte: id_compte,
              id_dossier: id_dossier,
              id_exercice: id_exercice,
              decltvamois: decltvamois,
              decltvaannee: decltvaannee,
              decltva: true
          }
      })

      const idEcritures = journalsData.map(j => j.id_ecriture);
      const uniqueIdEcrituresToUpdate = new Set(idEcritures);

      if (journalsData.length === 0) {
          return res.status(200).json({ message: `Aucune ligne à réinitaliser`, state: true });
      }

      await Journals.update(
          {
              decltvamois: 0,
              decltvaannee: 0,
              decltva: false
          }, {
          where: {
              id_ecriture: idEcritures
          }
      }
      )

      // await isis.destroy({
      //     where: {
      //         id_ecriture: idEcritures
      //     }
      // })

      const count = uniqueIdEcrituresToUpdate.size;
      return res.status(200).json({
          message: `${count} ${pluralize(count, "écriture")} ${pluralize(count, "réinitialisée")} avec succès`,
          state: true
      });

  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
  }
};

const generateAnnexeDeclarationAuto = async (req, res) => {
  try {
      const { id_compte, id_dossier, id_exercice, mois, annee } = req.body;

      if (!id_compte) {
          return res.status(400).json({ state: false, message: 'Id_compte non trouvé' });
      }
      if (!id_dossier) {
          return res.status(400).json({ state: false, message: 'Id_dossier non trouvé' });
      }
      if (!id_exercice) {
          return res.status(400).json({ state: false, message: 'Id_exercice non trouvé' });
      }
      if (!mois) {
          return res.status(400).json({ state: false, message: 'Mois manquante' });
      }
      if (!annee) {
          return res.status(400).json({ state: false, message: 'Année manquante' });
      }

      const journalData = await Journals.findAll({
          where: {
              id_compte,
              id_dossier,
              id_exercice,
              decltvamois: mois,
              decltvaannee: annee,
              decltva: true,
          },
          attributes: ['id', 'id_ecriture', 'num_facture', 'dateecriture', 'libelle', 'debit', 'credit', 'decltvamois', 'decltvaannee', 'decltva', 'id_numcpt', 'id_numcptcentralise', 'id_compte', 'id_dossier', 'id_exercice'],
          include: [
              {
                  model: dossierplancomptables,
                  attributes: ['compte'],
                  required: true,
              },
              { 
                model: codejournals,
                attributes: ['code', 'type', 'nif', 'stat', 'adresse', 'libelle'],
                required: false
              }
          ],
          order: [['dateecriture', 'ASC']]
      });
// return res.json(journalData)
      // Récupérer toutes les lignes de ces écritures (même si non déclarées) pour inclure 512
      const idsEcritures = Array.from(new Set(journalData.map(j => j.id_ecriture)));
      const allJournals = await Journals.findAll({
          where: {
              id_ecriture: idsEcritures,
              id_compte,
              id_dossier,
              id_exercice
          },
          include: [
              {
                  model: dossierplancomptables,
                  attributes: ['compte'],
                  required: true,
              },
              {
                  model: codejournals,
                  attributes: ['code', 'type', 'nif', 'stat', 'adresse', 'libelle'],
                  required: false
              }
          ],
          order: [['dateecriture', 'ASC']]
      });

      const mappedData = await Promise.all(
          allJournals.map(async (journal) => {
              const { dossierplancomptable, codejournal, ...rest } = journal.toJSON();
              const compte_centralise = await dossierplancomptables.findByPk(journal.id_numcptcentralise);
              return {
                ...rest,
                compte: dossierplancomptable?.compte || null,
                journal: codejournal?.code || null,
                journal_type: codejournal?.type || null,
                // Infos du journal (BANQUE)
                journal_nif: codejournal?.nif || null,
                journal_stat: (codejournal?.stat ?? codejournal?.statistique) || null,
                journal_adresse: codejournal?.adresse || null,
                journal_libelle: codejournal?.libelle || null,
                compte_cetralise: compte_centralise?.compte || null
              };
          })
      );

      const groupedData = Object.values(
          mappedData.reduce((acc, item) => {
              const compteStr = item.compte?.toString() || "";
              if (!(compteStr.startsWith("401") || compteStr.startsWith("411") || compteStr.startsWith("4456") || compteStr.startsWith("4457") || compteStr.startsWith("512") || compteStr.startsWith("53"))) {
                return acc;
            }

              if (!acc[item.id_ecriture]) {
                  acc[item.id_ecriture] = {
                      id_ecriture: item.id_ecriture,
                      num_facture: item.num_facture,
                      dateecriture: item.dateecriture,
                      journal: item.journal,
                      journal_type: item.journal_type,
                      // Infos journal
                      journal_nif: item.journal_nif || null,
                      journal_stat: item.journal_stat || null,
                      journal_adresse: item.journal_adresse || null,
                      journal_libelle: item.journal_libelle || null,

                      lignes: []
                  };
              }

              acc[item.id_ecriture].lignes.push({
                  compte: item.compte,
                  libelle: item.libelle,
                  debit: item.debit,
                  credit: item.credit,
                  id_numcpt: item.id_numcpt,
                  compte_centralise: item.compte_cetralise,
                  dateecriture: item.dateecriture
              });

              return acc;
          }, {}
          )
      )

      console.log('[ANNEXE][GEN] start', { compte: id_compte, dossier: id_dossier, exo: id_exercice, mois, annee });
      console.log('[ANNEXE][GEN] groupedData', { groups: groupedData.length });
      // return res.json(groupedData)

      const result = await Promise.all(
          groupedData.map(async (group) => {

            let dossierplanComptableData = null;
            
              
            const ligne401 = group.lignes.find(l => l.compte?.startsWith("401"));
            const ligne4456 = group.lignes.find(l => l.compte?.startsWith("4456"));
            const ligne4457 = group.lignes.find(l => l.compte?.startsWith("4457"));
            const ligne411 = group.lignes.find(l => l.compte?.startsWith("411"));
            // 512: détecter soit par compte 512, soit par journal BANQUE/BQ
            let ligne512 = group.lignes.find(l => l.compte.startsWith('512'));
            // if (!ligne512) {
            //   // si le groupe est de type BANQUE ou que certaines lignes portent journal 'BQ'
            //   if (group.journal_type === 'BANQUE') {
            //     // fallback: choisir la ligne avec le plus grand montant absolu comme proxy de flux bancaire
            //     ligne512 = [...group.lignes].sort((a, b) => (Math.abs((b.debit||0)-(b.credit||0)) - Math.abs((a.debit||0)-(a.credit||0))))[0] || null;
            //   } else {
            //     const candidateBQ = group.lignes.find(l => l.journal === 'BQ');
            //     if (candidateBQ) ligne512 = candidateBQ;
            //   }
            // }
            const ligne53 = group.lignes.find(l => l.compte?.startsWith("53"));
            
                          // >>> AJOUTE TON LOG ICI <<<
              const abs = (x) => Math.abs(Number(x || 0));
              console.log('[ANNEXE][GROUP]', {
                id_ecriture: group.id_ecriture,
                journal: group.journal,
                journal_type: group.journal_type,
                lignes: group.lignes?.length || 0,
                has512: Boolean(ligne512),
                compte_512: ligne512?.compte || null,
                m512: ligne512 ? (Number(ligne512.debit||0) - Number(ligne512.credit||0)) : null,
                hasTVA4456: Boolean(ligne4456),
                hasTVA4457: Boolean(ligne4457),
              });
            // Priorité: utiliser la ligne TVA (4456 ou 4457) pour id_numcpt
            const ligneTVA = ligne4456 || ligne4457;
            if (ligneTVA) {
              dossierplanComptableData = await dossierplancomptables.findByPk(ligneTVA.id_numcpt);
            } else if (ligne401) {
              dossierplanComptableData = await dossierplancomptables.findByPk(ligne401.id_numcpt);
            } else if (ligne411) {
              dossierplanComptableData = await dossierplancomptables.findByPk(ligne411.id_numcpt);
            } else if (ligne512) {
              dossierplanComptableData = await dossierplancomptables.findByPk(ligne512.id_numcpt);
            } else if (ligne53) {
              dossierplanComptableData = await dossierplancomptables.findByPk(ligne53.id_numcpt);
            }

           // BANQUE si type BANQUE OU présence de 512
            const isBanque = (group.journal_type === 'BANQUE') || Boolean(ligne512);

            // Sources par défaut depuis le plan comptable
            const src_nif_default = dossierplanComptableData?.nif || '';
            const src_stat_default = dossierplanComptableData?.statistique || '';
            const src_adresse_default = dossierplanComptableData?.adresse || '';

            // ACHAT/VENTE: raison sociale = libelle du plan comptable (TVA si dispo)
            // Si libelle du PC est vide, fallback sur le libellé de l’écriture pour ne pas laisser “ - ”
            const pc_libelle = dossierplanComptableData?.libelle || '';
            const src_rs_default = pc_libelle || group.libelle || '';

            // Si BANQUE: privilégier les infos venant du journal (codejournals)
            const src_nif = isBanque ? (group.journal_nif ?? src_nif_default) : src_nif_default;
            const src_stat = isBanque ? (group.journal_stat ?? src_stat_default) : src_stat_default;
            const src_adresse = isBanque ? (group.journal_adresse ?? src_adresse_default) : src_adresse_default;

            // Raison sociale:
            // - BANQUE: libellé du journal (nom de la banque)
            // - Autres (ACHAT/VENTE): libellé du PC, sinon fallback libellé d’écriture
            const src_rs = isBanque
              ? ((group.journal_libelle || src_rs_default) || ' - ')
              : (src_rs_default || ' - ');

 
              if (!isBanque) {
                console.log('[TVA][DEBUG PC]', {
                  id_ecriture: group.id_ecriture,
                  pc_id: dossierplanComptableData?.id,
                  pc_compte: dossierplanComptableData?.compte,
                  pc_libelle: dossierplanComptableData?.libelle,
                  group_libelle: group.libelle
                });
              }


              let montant_ttc = 0;
              let montant_ht = 0;
              let montant_tva = 0;
              // Debug logs
              console.log("=== DEBUG GROUP ===");
              console.log("group.journal:", group.journal);
              console.log("group.journal_type:", group.journal_type);
              console.log("group.num_facture:", group.num_facture);
              console.log("ligne4456:", group.lignes.find(l => l.compte?.startsWith("4456")));
              console.log("ligne401:", group.lignes.find(l => l.compte?.startsWith("401")));
              console.log("ligne4457:", group.lignes.find(l => l.compte?.startsWith("4457")));
              console.log("ligne411:", group.lignes.find(l => l.compte?.startsWith("411")));
              console.log("ligne512:", group.lignes.find(l => l.compte?.startsWith("512")));
              console.log("ligne53:", group.lignes.find(l => l.compte?.startsWith("53")));
 

              // Logique ACHAT (type ACHAT ou code AC/HA) + 4456 + 401
              if (
                group.journal_type === "ACHAT"
              ) {

                if (ligne401 && ligne4456) {
                  montant_ttc = (Number(ligne401?.credit) || 0) - (Number(ligne401?.debit) || 0);
                  montant_tva = (Number(ligne4456?.debit) || 0) - (Number(ligne4456?.credit) || 0);
                  montant_ht = montant_ttc - montant_tva;
                }
                if (ligne411 && ligne4457) {
                  montant_ttc = (Number(ligne411?.debit) || 0) - (Number(ligne411?.credit) || 0);
                  montant_tva = (Number(ligne4457?.credit) || 0) - (Number(ligne4457?.debit) || 0);
                  montant_ht = montant_ttc - montant_tva;
                }

              }

              // Logique VENTE (type VENTE ou code VTE) + 4457 + 411
              if (
                group.journal_type === "VENTE"
              ) {
                const ligne411 = group.lignes.find(l => l.compte?.startsWith("411"));
                const ligne4457 = group.lignes.find(l => l.compte?.startsWith("4457"));
                if (ligne411 && ligne4457) {
                  montant_ttc = (Number(ligne411?.debit) || 0) - (Number(ligne411?.credit) || 0);
                  montant_tva = (Number(ligne4457?.credit) || 0) - (Number(ligne4457?.debit) || 0);
                  montant_ht = montant_ttc - montant_tva;
                }
                if (ligne401 && ligne4456) {
                  montant_ttc = (Number(ligne401?.credit) || 0) - (Number(ligne401?.debit) || 0);
                  montant_tva = (Number(ligne4456?.debit) || 0) - (Number(ligne4456?.credit) || 0);
                  montant_ht = montant_ttc - montant_tva;
                }
              }

              if(
                group.journal_type === "BANQUE"
              ){
                const ligne512 = group.lignes.find(l => l.compte?.startsWith("512"));
                const ligne4456 = group.lignes.find(l => l.compte?.startsWith("4456"));
                if(ligne512 && ligne4456){
                  montant_ttc = (Number(ligne512?.credit) || 0) - (Number(ligne512?.debit) || 0);
                  montant_tva = (Number(ligne4456?.debit) || 0) - (Number(ligne4456?.credit) || 0);
                  montant_ht = montant_ttc - montant_tva;
                  console.log("BANQUE", montant_ttc, montant_tva, montant_ht)
                }
              }
              if(
                group.journal_type === "CAISSE"
              ){
                const ligne53 = group.lignes.find(l => l.compte?.startsWith("53"));
                const ligne4456 = group.lignes.find(l => l.compte?.startsWith("4456"));
                const ligne4457 = group.lignes.find(l => l.compte?.startsWith("4457"));
                if(ligne53 && ligne4456){
                  // montant_ttc = (Number(ligne53?.credit) || 0) - (Number(ligne53?.debit) || 0);
                  montant_tva = (Number(ligne4456?.debit) || 0) - (Number(ligne4456?.credit) || 0);
                  // montant_ht = montant_ttc - montant_tva;
                  console.log("CAISSE", montant_ttc, montant_tva, montant_ht)
                }
                if(ligne53 && ligne4457){
                  // montant_ttc = (Number(ligne53?.credit) || 0) - (Number(ligne53?.debit) || 0);
                  montant_tva = (Number(ligne4457?.credit) || 0) - (Number(ligne4457?.debit) || 0);
                  // montant_ht = montant_ttc - montant_tva;
                  console.log("CAISSE", montant_ttc, montant_tva, montant_ht)
                }
              }

              // Déterminer Collecte (C) ou Déductible (D) selon le compte TVA
              const is4456 = group.lignes.some(l => l.compte?.startsWith("4456"));
              const is4457 = group.lignes.some(l => l.compte?.startsWith("4457"));
              const collecteDeductible = is4456 ? 'D' : (is4457 ? 'C' : null);

              // Déterminer Local/Etranger à partir de typetier
              const typeTierValue = (dossierplanComptableData?.typetier || '').toString().trim().toLowerCase();
              const localEtranger = typeTierValue === 'etranger' ? 'E' : 'L';

              // Déterminer s'il y a des anomalies (nif ou stat vide/null)
              const nif = dossierplanComptableData?.nif || '';
              const stat = dossierplanComptableData?.statistique || '';
              const anomalies = !nif || !stat || nif.trim() === '' || stat.trim() === '';

              return {
                  id_compte: id_compte,
                  id_dossier: id_dossier,
                  id_exercice: id_exercice,
                  // Propager l'ID du compte TVA (4456/4457) si dispo
                  id_numcpt: (ligneTVA?.id_numcpt) || dossierplanComptableData?.id || null,
                  id_ecriture: group.id_ecriture,
                  collecte_deductible: collecteDeductible,
                  local_etranger: localEtranger,
                  nif: src_nif || ' - ',
                  raison_sociale: src_rs || ' - ',
                  stat: src_stat || ' - ',
                  adresse: src_adresse || ' - ',
                  montant_ht: montant_ht,
                  montant_tva: montant_tva,
                  montant_ttc: montant_ttc,
                  reference_facture: group.num_facture || ' - ',
                  date_facture: group.dateecriture,
                  nature: dossierplanComptableData?.nature || ' - ',
                  libelle_operation: group.libelle || ' - ',
                  date_paiement: group.dateecriture,
                  mois: mois,
                  annee: annee,
                  observation: group.observation || ' - ',
                  n_dau: group.n_dau || ' - ',
                  ligne_formulaire: group.ligne_formulaire || ' - ',
                  anomalies: anomalies,
                  commentaire: null, // À remplir plus tard
                  code_tva: null, // À remplir plus tard
                  // Informations 512 (banque) pour faciliter l'analyse côté UI/exports
                  compte_512: ligne512?.compte || null,
                  montant_512: ligne512 ? ((Number(ligne512.debit || 0)) - (Number(ligne512.credit || 0))) : null,
                  // Debug info temporaire
                  debug: {
                    journal: group.journal,
                    journal_type: group.journal_type,
                    montant_ttc: montant_ttc,
                    montant_ht: montant_ht,
                    montant_tva: montant_tva,
                    condition_achat: Boolean(
                      (group.journal_type === "ACHAT") &&
                      group.lignes.some(l => l.compte?.startsWith("401")) &&
                      group.lignes.some(l => l.compte?.startsWith("4456"))


                    ),
                    condition_vente: Boolean(
                      (group.journal_type === "VENTE") &&
                      group.lignes.some(l => l.compte?.startsWith("411")) &&
                      group.lignes.some(l => l.compte?.startsWith("4457"))
                    ),
                    condition_banque: Boolean(
                      (group.journal_type === "BANQUE") &&
                      group.lignes.some(l => l.compte?.startsWith("512")) &&
                      group.lignes.some(l => l.compte?.startsWith("4456"))
                    ),
                    condition_caisse: Boolean(
                      (group.journal_type === "CAISSE") &&
                      group.lignes.some(l => l.compte?.startsWith("53")) &&
                      group.lignes.some(l => l.compte?.startsWith("4456"))
                    ),
                  }
            };
          })
      );

      // Avant insert, compléter code_tva et commentaire pour persister en base
      // Précharger mapping paramtva (id_cptcompta -> type) et listecodetva (id -> code)
      const paramRows = await paramtvas.findAll({ where: { id_dossier } });
      const codeRows = await listecodetvas.findAll();
      const mapCompteToType = new Map((paramRows || []).map(p => [Number(p.id_cptcompta), Number(p.type)]));
      const mapTypeToCode = new Map((codeRows || []).map(c => [Number(c.id), c.code]));

      const isEmpty = (v) => {
        const s = String(v ?? '').trim();
        if (s === '') return true;
        const low = s.toLowerCase();
        return low === 'n/a' || low === 'na' || low === 'null' || low === 'undefined' || low === '-';
      };

      result.forEach((row) => {
        // code_tva
        if (!row.code_tva && row.id_numcpt) {
          const typeId = mapCompteToType.get(Number(row.id_numcpt));
          if (typeId) {
            const code = mapTypeToCode.get(Number(typeId));
            if (code) row.code_tva = code;
          }
        }
        // commentaire + anomalies
        const notes = [];
        if (isEmpty(row.nif)) notes.push('NIF vide');
        if (isEmpty(row.stat)) notes.push('STAT vide');
        if (isEmpty(row.raison_sociale)) notes.push('Raison sociale vide');
        if (isEmpty(row.adresse)) notes.push('Adresse vide');
        if (isEmpty(row.reference_facture)) notes.push('Référence facture vide');
        if (isEmpty(row.date_facture)) notes.push('Date facture vide');
        if (!row.code_tva) notes.push('Code TVA introuvable pour le compte');
        row.commentaire = notes.join(', ');
        row.anomalies = notes.length > 0;
      });

      // return res.json(result)

      const idsToInsert = result.map(r => r.id_ecriture);

      // Vérifier les ID existants avant l'insert
      const existingIds = new Set(
          (await tva_annexes.findAll({
              where: { id_ecriture: idsToInsert },
              attributes: ['id_ecriture']
          })).map(r => r.id_ecriture)
      );

      console.log('[ANNEXE][GEN] result size', result.length);
      console.table(
        result.slice(0, 10).map(r => ({
          id_ecriture: r.id_ecriture,
          compte_512: r.compte_512,
          montant_512: r.montant_512,
          montant_tva: r.montant_tva,
          code_tva: r.code_tva,
          anomalies: r.anomalies
        }))
      );
      const isiRows = await tva_annexes.bulkCreate(result, {
          updateOnDuplicate: [
              'montant_ht', 'montant_tva', 'montant_ttc', 'reference_facture', 'date_facture', 'nature', 'libelle_operation', 'date_paiement', 'observation', 'n_dau', 'ligne_formulaire', 'anomalies', 'commentaire', 'code_tva'
          ],
          returning: true
      });

      const created = isiRows.filter(r => !existingIds.has(r.id_ecriture)).length;
      const updated = isiRows.length - created;

      let message = '';

      if (created === 0 && updated === 0) {
          message = "Aucune TVA à générer";
      } else if (created > 0 && updated === 0) {
          message = `${created} TVA ${pluralize(created, "créée")} avec succès`;
      } else if (updated > 0 && created === 0) {
          message = `${updated} TVA ${pluralize(updated, "modifiée")} avec succès`;
      } else {
          message = `${created} TVA ${pluralize(created, "créée")} et ${updated} TVA ${pluralize(updated, "modifiée")} avec succès`;
      }

              res.json({
            state: true,
            message,
            data: isiRows
        });

      // const existingIds = (await isis.findAll({
      //     where: {
      //         id_ecriture: result.map(r => r.id_ecriture)
      //     },
      //     attributes: ['id_ecriture']
      // })).map(r => r.id_ecriture);

      // const toCreate = result.filter(r => !existingIds.includes(r.id_ecriture));
      // const toUpdate = result.filter(r => existingIds.includes(r.id_ecriture));

      // await isis.bulkCreate(toCreate);

      // for (const row of toUpdate) {
      //     await isis.update(
      //         {
      //             nom: row.nom,
      //             province: row.province,
      //             region: row.region,
      //             district: row.district,
      //             commune: row.commune,
      //             fokontany: row.fokontany,
      //             cin: row.cin,
      //             montant_isi: row.montant_isi,
      //             montant_transaction: row.montant_transaction,
      //             anomalie: row.anomalie
      //         },
      //         { where: { id_ecriture: row.id_ecriture } }
      //     );
      // }

      // res.json({ state: true, created: toCreate.length, updated: toUpdate.length });

      // return res.json({ groupedData, result });
      console.log('[ANNEXE][GEN] created/updated', { created, updated, total: isiRows.length });

  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
  }
}

const generateTvaAutoDetail = async (req, res) => {
  try {
      const { id_dossier, id_compte, id_exercice, decltvaannee, decltvamois } = req.body;
      if (!id_dossier || !id_compte || !id_exercice || !decltvaannee || !decltvamois) {
          return res.status(400).json({ state: false, message: 'Données manquantes' });
      }

      await Journals.update(
          {
              decltvaannee: 0,
              decltvamois: 0,
              decltva: false
          },
          {
              where: {
                  id_dossier: id_dossier,
                  id_compte: id_compte,
                  id_exercice: id_exercice,
                  decltva: true,
                  decltvaannee: decltvaannee,
                  decltvamois: decltvamois
              }
          }
      )

      let dateFilter = {};

      if (decltvaannee && decltvamois) {
        const mois = parseInt(decltvamois, 10);
        const annee = parseInt(decltvaannee, 10);
      

        // const startDate = new Date(annee, mois - 3, 1);
        // console.log("nvsidvbusd",startDate);
        const startDate = new Date(annee, mois - 4, 1);
        const formatted = startDate.toLocaleDateString('sv-SE'); // format YYYY-MM-DD
        console.log("startDate",formatted); 


        const endDate = new Date(annee, mois, 0);
        endDate.setHours(23, 59, 59, 999);
        const formattedEndDate = endDate.toLocaleDateString('sv-SE'); // format YYYY-MM-DD
        console.log("endDate",formattedEndDate);
      
        dateFilter = { dateecriture: { [Op.between]: [startDate, endDate] } };
      }

      const journalData = await Journals.findAll({
          where: {
              id_compte,
              id_dossier,
              id_exercice,
              decltvaannee: 0,
              decltvamois: 0,
              decltva: false,
              ...dateFilter
          },
          include: [
              {
                  model: dossierplancomptables,
                  attributes: ['compte'],
              },
              {
                  model: codejournals,
                  attributes: ['code']
              }
          ],
          order: [['dateecriture', 'ASC']]
      });

      // return res.json(journalData);

      if (!journalData) {
          return res.status(200).json({ message: `Aucune journal trouvé`, state: false });
      }

      const idEcritures = journalData.map(j => j.id_ecriture);

      const uniqueIdEcritures = [...new Set(idEcritures)];

      // return res.json(idEcritures);

      const allJournals = await Journals.findAll({
          where: {
              id_ecriture: uniqueIdEcritures
          },
          include: [
              {
                  model: dossierplancomptables,
                  attributes: ['compte'],
                  required: true
              },
              {
                  model: codejournals,
                  attributes: ['code']
              }
          ],
          order: [['dateecriture', 'ASC']]
      });

      // return res.json(allJournals);

      const mappedAllJournals = await Promise.all(
          allJournals.map(async (journal) => {
              const { dossierplancomptable, codejournal, ...rest } = journal.toJSON();
              const compte_centralise = await dossierplancomptables.findByPk(journal.id_numcptcentralise);

              return {
                  ...rest,
                  compte: dossierplancomptable?.compte || null,
                  journal: codejournal?.code || null,
                  comptecentralisation: compte_centralise?.compte || null
              };
          })
      );

      // return res.json(mappedAllJournals);

      const filteredJournals = mappedAllJournals.filter(j => j.compte && (j.compte.startsWith("4456") || j.compte.startsWith("4457")));

      // return res.json(filteredJournals);

      const idsEcritureToUpdate = filteredJournals.map(j => j.id_ecriture);

      const uniqueIdEcrituresToUpdate = new Set(idsEcritureToUpdate);

      // return res.json(uniqueIdEcrituresToUpdate);

      await Journals.update(
          {
              decltvaannee,
              decltvamois,
              decltva: true
          },
          {
              where: {
                  id_ecriture: idsEcritureToUpdate
              }
          }
      );

      const count = uniqueIdEcrituresToUpdate.size;
      return res.status(200).json({
        message: `${count} ${pluralize(count, "écriture")} ${pluralize(count, "générée")} avec succès`,
        state: true,
        count
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
  }
};

const getDetailEcritureAssocie = async (req, res) => {
  try {
      const { id_compte, id_dossier, id_exercice } = req.params;
      const { mois, annee, compteisi } = req.query;

      if (!id_compte) {
          return res.status(400).json({ state: false, message: 'Id_compte non trouvé' });
      }
      if (!id_dossier) {
          return res.status(400).json({ state: false, message: 'Id_dossier non trouvé' });
      }
      if (!id_exercice) {
          return res.status(400).json({ state: false, message: 'Id_exercice non trouvé' });
      }
      if (!mois) {
          return res.status(400).json({ state: false, message: 'Mois manquante' });
      }
      if (!annee) {
          return res.status(400).json({ state: false, message: 'Année manquante' });
      }


      const journalData = await Journals.findAll({
          where: {
              id_compte,
              id_dossier,
              id_exercice,
              decltvamois: mois,
              decltvaannee: annee,
              decltva: true,
          },
          include: [
              {
                  model: dossierplancomptables,
                  attributes: ['compte'],
                  required: true,
              },
              { model: codejournals, attributes: ['code'] }
          ],
          order: [['dateecriture', 'ASC']]
      });

      const mappedData = await Promise.all(
          journalData.map(async (journal) => {
              const { dossierplancomptable, codejournal, ...rest } = journal.toJSON();
              const compte_centralise = await dossierplancomptables.findByPk(journal.id_numcptcentralise);
              return {
                  ...rest,
                  compte: dossierplancomptable?.compte || null,
                  journal: codejournal?.code || null,
                  compte_cetralise: compte_centralise?.compte || null
              };
          }));

      return res.json({
          list: mappedData,
          state: true,
          message: "Récupéré avec succès"
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
  }
};

 
module.exports = {
  getListeCodeTva,
  listeParamTva,
  paramTvaAdd,
  paramTvaDelete,
  listJournalsByCompte,
  createJournal,
  // updateJournalsDeclaration,
  // updateJournalsUndeclare,
  updateJournalsDeclFlag,
  getJournalsSelectionLigne,
  recupPcClasseSix,
  getJournalsDeclTvaClasseTva,
  generateAnnexeDeclarationAuto,
  ajoutMoisAnnee,
  reinitializeTva,
  suppressionMoisAnnee,
  generateTvaAutoDetail,
  getDetailEcritureAssocie
};