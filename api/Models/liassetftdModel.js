//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liassetftds = sequelize.define( "liassetftds", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            autoIncrement:true,
            primaryKey:true
        },
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        id_dossier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_exercice: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_etat: {
            type: DataTypes.STRING(25),
            allowNull: false,
            defaultValue:0
        },
        subtable: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        id_rubrique: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0,
            references:
                        {
                            model: rubriquesMatrices,
                            key: 'id_rubrique'
                        }
        },
        note: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        montant_net: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montant_net_n1: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        ordre: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        niveau: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        nature: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
    }, {timestamps: true}, )
    return liassetftds;
 }