//importing modules
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

//Database connection with dialect of postgres specifying the database we are using
//port for my database is 5433
//database name is discover
const DB_ConnexionString = `postgresql://${process.env.NODE_API_USER}:${process.env.NODE_API_PWD}@${process.env.NODE_API_URL}:${process.env.NODE_API_PORT}/${process.env.NODE_API_DBNAME}`;
const sequelize = new Sequelize(DB_ConnexionString, { dialect: "postgres" })
//const sequelize = new Sequelize(`postgresql://postgres:admin@localhost:5432/kaonty`, {dialect: "postgres"})

//checking if connection is done
sequelize.authenticate().then(() => {
    console.log(`Database connected to discover`)
}).catch((err) => {
    console.log(err)
})

const db = {}

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.Sequelize = Sequelize
db.sequelize = sequelize

//connecting to model
db.users = require('./userModel')(sequelize, DataTypes);
db.userscomptes = require('./compteModel')(sequelize, DataTypes);
db.dossiers = require('./dossiersModel')(sequelize, DataTypes);
db.dossierassocies = require('./dossiersAssociesModel')(sequelize, DataTypes);
db.dossierfiliales = require('./dossiersFilialesModel')(sequelize, DataTypes);
db.modelePlanComptable = require('./modelePCModele')(sequelize, DataTypes);
db.dossierplancomptable = require('./dossierPCModel')(sequelize, DataTypes);
db.modeleplancomptabledetail = require('./modelePCDetailModel')(sequelize, DataTypes);
db.modeleplancomptabledetailcptchg = require('./modelePCDetailsCptChgModel')(sequelize, DataTypes);
db.modeleplancomptabledetailcpttva = require('./modelePCDetailCptTvaModel')(sequelize, DataTypes);
db.exercices = require('./exercicesModel')(sequelize, DataTypes);
db.dombancaires = require('./domBancaireModel')(sequelize, DataTypes);
db.balances = require('./balanceModel')(sequelize, DataTypes);
db.codejournals = require('./codejournalsModel')(sequelize, DataTypes);
db.dossierpcdetailcptchg = require('./dossierPCDetailCptChgModel')(sequelize, DataTypes);
db.dossierpcdetailcpttva = require('./dossierPCDetailCptTvaModel')(sequelize, DataTypes);
db.listecodetvas = require('./listeCodetvasModel')(sequelize, DataTypes);
db.paramtvas = require('./paramtvasModel')(sequelize, DataTypes);
db.liassebhiapcs = require('./liassebhiapcModel')(sequelize, DataTypes);
db.liassebilans = require('./liassebilanModel')(sequelize, DataTypes);
db.liassecrfs = require('./liassecrfModel')(sequelize, DataTypes);
db.liassecrns = require('./liassecrnModel')(sequelize, DataTypes);
db.liassedas = require('./liassedaModel')(sequelize, DataTypes);
db.liassedps = require('./liassedpModel')(sequelize, DataTypes);
db.liassedrfs = require('./liassedrfModel')(sequelize, DataTypes);
db.liasseeiafncs = require('./liasseeiafncModel')(sequelize, DataTypes);
db.liasseevcps = require('./liasseevcpModel')(sequelize, DataTypes);
db.liassempautres = require('./liassempautreModel')(sequelize, DataTypes);
db.liassemps = require('./liassempModel')(sequelize, DataTypes);
db.liassenotes = require('./liassenoteModel')(sequelize, DataTypes);
db.liassesads = require('./liassesadModel')(sequelize, DataTypes);
db.liassesdrs = require('./liassesdrModel')(sequelize, DataTypes);
db.liasseses = require('./liasseseModel')(sequelize, DataTypes);
db.liassetftds = require('./liassetftdModel')(sequelize, DataTypes);
db.liassetftis = require('./liassetftiModel')(sequelize, DataTypes);
db.etats = require('./etatsModel')(sequelize, DataTypes);
db.pays = require('./paysModel')(sequelize, DataTypes);
db.etatsmatrices = require('./etatsMatriceModel')(sequelize, DataTypes);
db.rubriques = require('./rubriquesModel')(sequelize, DataTypes);
db.rubriquesmatrices = require('./rubriquesMatriceModel')(sequelize, DataTypes);
db.compterubriques = require('./compterubriqueModel')(sequelize, DataTypes);
db.compterubriquematrices = require('./compterubriqueMatriceModel')(sequelize, DataTypes);
db.situations = require('./situationsModel')(sequelize, DataTypes);
db.journals = require('./journalsModel')(sequelize, DataTypes);
db.balanceimportees = require('./balanceimporteesModel')(sequelize, DataTypes);
db.ajustements = require('./ajustementModel')(sequelize, DataTypes);
db.devises = require('./deviseModel')(sequelize, DataTypes);

// 
db.droitcommas = require('./droitCommModelA')(sequelize, DataTypes);
db.droitcommbs = require('./droitCommModelB')(sequelize, DataTypes);
db.etatscomms = require('./etatsCommModel')(sequelize, DataTypes);
db.etatscomatrices = require('./etatsCommMatriceModel')(sequelize, DataTypes);
db.etatsplp = require('./etatsPlpModel')(sequelize, DataTypes);
db.etatsplpmatrices = require('./etatsPlpMatriceModel')(sequelize, DataTypes);
//

//
db.caSections = require('./caSectionMolel')(sequelize, DataTypes);
db.caAxes = require('./caAxeModel')(sequelize, DataTypes);
//

//définition des associations
db.rubriques.belongsTo(db.rubriquesmatrices, { as: 'rubriquematrix', foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.rubriques.hasMany(db.ajustements, { as: 'ajusts', foreignKey: 'id_rubrique', sourceKey: 'id_rubrique' });
db.rubriques.hasMany(db.balances, { as: 'details', foreignKey: 'rubriquebilanbrut', sourceKey: 'id_rubrique' });
db.rubriques.hasMany(db.balances, { as: 'detailsCRN', foreignKey: 'rubriquecrn', sourceKey: 'id_rubrique' });
db.rubriques.hasMany(db.balances, { as: 'detailsCRF', foreignKey: 'rubriquecrf', sourceKey: 'id_rubrique' });
db.rubriques.hasMany(db.balances, { as: 'detailsTFTI', foreignKey: 'rubriquetfti', sourceKey: 'id_rubrique' });
db.rubriques.hasMany(db.balances, { as: 'detailsTFTD', foreignKey: 'rubriquetftd', sourceKey: 'id_rubrique' });

//
db.userscomptes.hasMany(db.devises, { foreignKey: 'compte_id', sourceKey: 'id' });
db.dossierplancomptable.hasMany(db.journals, { foreignKey: 'id_numcpt', sourceKey: 'id' });
db.codejournals.hasMany(db.journals, { foreignKey: 'id_journal', sourceKey: 'id' });

db.balances.belongsTo(db.dossierplancomptable, { as: 'infosCompte', foreignKey: 'id_numcompte', targetKey: 'id' });
db.liassebhiapcs.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liassedas.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liassedps.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liassedrfs.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liasseeiafncs.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liasseevcps.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liasseevcps.hasMany(db.ajustements, { as: 'ajustsEVCP', foreignKey: 'id_rubrique', sourceKey: 'id_rubrique' });
db.liassempautres.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liassemps.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liassenotes.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liassesads.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liassesdrs.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.liasseses.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });

//
db.devises.belongsTo(db.userscomptes, { foreignKey: 'compte_id', targetKey: 'id' });
db.journals.belongsTo(db.dossierplancomptable, { foreignKey: 'id_numcpt', targetKey: 'id' });
db.journals.belongsTo(db.codejournals, { foreignKey: 'id_journal', targetKey: 'id' });

// Droit de communication
// Premier table
db.userscomptes.hasMany(db.droitcommas, { foreignKey: 'id_compte', sourceKey: 'id' });
db.droitcommas.belongsTo(db.userscomptes, { foreignKey: 'id_compte', targetKey: 'id' });

db.dossiers.hasMany(db.droitcommas, { foreignKey: 'id_dossier', sourceKey: 'id' });
db.droitcommas.belongsTo(db.dossiers, { foreignKey: 'id_dossier', targetKey: 'id' });

db.exercices.hasMany(db.droitcommas, { foreignKey: 'id_exercice', sourceKey: 'id' });
db.droitcommas.belongsTo(db.exercices, { foreignKey: 'id_exercice', targetKey: 'id' });

// Deuxième table
db.userscomptes.hasMany(db.droitcommbs, { foreignKey: 'id_compte', sourceKey: 'id' });
db.droitcommbs.belongsTo(db.userscomptes, { foreignKey: 'id_compte', targetKey: 'id' });

db.dossiers.hasMany(db.droitcommas, { foreignKey: 'id_dossier', sourceKey: 'id' });
db.droitcommbs.belongsTo(db.dossiers, { foreignKey: 'id_dossier', targetKey: 'id' });

db.exercices.hasMany(db.droitcommbs, { foreignKey: 'id_exercice', sourceKey: 'id' });
db.droitcommbs.belongsTo(db.exercices, { foreignKey: 'id_exercice', targetKey: 'id' });

// Etat comm
db.userscomptes.hasMany(db.etatscomms, { foreignKey: 'id_compte', sourceKey: 'id' });
db.etatscomms.belongsTo(db.userscomptes, { foreignKey: 'id_compte', targetKey: 'id' });

db.dossiers.hasMany(db.droitcommas, { foreignKey: 'id_dossier', sourceKey: 'id' });
db.etatscomms.belongsTo(db.dossiers, { foreignKey: 'id_dossier', targetKey: 'id' });

db.exercices.hasMany(db.etatscomms, { foreignKey: 'id_exercice', sourceKey: 'id' });
db.etatscomms.belongsTo(db.exercices, { foreignKey: 'id_exercice', targetKey: 'id' });

// Etat plp
db.userscomptes.hasMany(db.etatsplp, { foreignKey: 'id_compte', sourceKey: 'id' });
db.etatsplp.belongsTo(db.userscomptes, { foreignKey: 'id_compte', targetKey: 'id' });

db.dossiers.hasMany(db.droitcommas, { foreignKey: 'id_dossier', sourceKey: 'id' });
db.etatsplp.belongsTo(db.dossiers, { foreignKey: 'id_dossier', targetKey: 'id' });

db.exercices.hasMany(db.etatsplp, { foreignKey: 'id_exercice', sourceKey: 'id' });
db.etatsplp.belongsTo(db.exercices, { foreignKey: 'id_exercice', targetKey: 'id' });

// Comptabilité analitique

// Axe
db.userscomptes.hasMany(db.caAxes, { foreignKey: 'id_compte', sourceKey: 'id' });
db.caAxes.belongsTo(db.userscomptes, { foreignKey: 'id_compte', targetKey: 'id' });

db.dossiers.hasMany(db.caAxes, { foreignKey: 'id_dossier', sourceKey: 'id' });
db.caAxes.belongsTo(db.dossiers, { foreignKey: 'id_dossier', targetKey: 'id' });

// Section
db.userscomptes.hasMany(db.caSections, { foreignKey: 'id_compte', sourceKey: 'id' });
db.caSections.belongsTo(db.userscomptes, { foreignKey: 'id_compte', targetKey: 'id' });

db.dossiers.hasMany(db.caSections, { foreignKey: 'id_dossier', sourceKey: 'id' });
db.caSections.belongsTo(db.dossiers, { foreignKey: 'id_dossier', targetKey: 'id' });

db.caSections.belongsTo(db.caAxes, { foreignKey: 'id_axe', targetKey: 'id' });
db.caAxes.hasMany(db.caSections, { foreignKey: 'id_axe', sourceKey: 'id' });

//exporting the module
module.exports = db;