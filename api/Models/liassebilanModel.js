//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liassebilans = sequelize.define( "liassebilans", {
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
        montantbrut: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montantamort: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montantnet: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montantnetn1: {
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
    return liassebilans;
 }