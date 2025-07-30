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

//définition des associations
db.rubriques.belongsTo(db.rubriquesmatrices, { as: 'rubriquematrix', foreignKey: 'id_rubrique', targetKey: 'id_rubrique' });
db.rubriques.hasMany(db.ajustements, { as: 'ajusts', foreignKey: 'id_rubrique', sourceKey: 'id_rubrique' });
db.rubriques.hasMany(db.balances, { as: 'details', foreignKey: 'rubriquebilanbrut', sourceKey: 'id_rubrique' });
db.rubriques.hasMany(db.balances, { as: 'detailsCRN', foreignKey: 'rubriquecrn', sourceKey: 'id_rubrique' });
db.rubriques.hasMany(db.balances, { as: 'detailsCRF', foreignKey: 'rubriquecrf', sourceKey: 'id_rubrique' });
db.rubriques.hasMany(db.balances, { as: 'detailsTFTI', foreignKey: 'rubriquetfti', sourceKey: 'id_rubrique' });
db.rubriques.hasMany(db.balances, { as: 'detailsTFTD', foreignKey: 'rubriquetftd', sourceKey: 'id_rubrique' });

db.balances.belongsTo(db.dossierplancomptable, {as: 'infosCompte', foreignKey: 'id_numcompte', targetKey: 'id'});
db.liassebhiapcs.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liassedas.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liassedps.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liassedrfs.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liassedrfs.hasMany(db.ajustements, { as: 'ajustsDRF',foreignKey: 'id_rubrique', sourceKey: 'id_rubrique'});
db.liasseeiafncs.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liasseevcps.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liasseevcps.hasMany(db.ajustements, { as: 'ajustsEVCP',foreignKey: 'id_rubrique', sourceKey: 'id_rubrique'});
db.liassempautres.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liassemps.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liassenotes.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liassesads.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liassesads.hasMany(db.ajustements, { as: 'ajustsSAD',foreignKey: 'id_rubrique', sourceKey: 'id_rubrique'});
db.liassesdrs.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});
db.liassesdrs.hasMany(db.ajustements, { as: 'ajustsSDR',foreignKey: 'id_rubrique', sourceKey: 'id_rubrique'});
db.liasseses.belongsTo(db.rubriquesmatrices, { foreignKey: 'id_rubrique' , targetKey: 'id_rubrique'});

//exporting the module
module.exports = db;