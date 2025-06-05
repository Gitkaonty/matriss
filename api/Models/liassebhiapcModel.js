//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liassebhiapcs = sequelize.define( "liassebhiapcs", {
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
        libelle: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        nif: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        raison_sociale: {
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        adresse: {
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        montant_charge: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montant_beneficiaire: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        compte: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        nature: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ordre: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
    }, {timestamps: true}, )
    return liassebhiapcs;
 }