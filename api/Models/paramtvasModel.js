const dossierplancomptables = require('./dossierPCModel');
const listecodetvas = require('./listeCodetvasModel');

module.exports = (sequelize, DataTypes) => {
    const paramtvas = sequelize.define( "paramtvas", {
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        id_dossier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_cptcompta: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0,
            references:
            {
                model: dossierplancomptables,
                key: 'id'
            }
        },
        type: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true,
            references: 
            {
                model: listecodetvas,
                key: 'id'
            }
        },
    }, {timestamps: true}, )
    return paramtvas
 }