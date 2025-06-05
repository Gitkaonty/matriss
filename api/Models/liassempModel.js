//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liassemps = sequelize.define( "liassemps", {
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
        ref_marche: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        date_paiement: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        montant_marche_ht: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        tmp: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montant_paye: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        marche: {
            type: DataTypes.STRING(250),
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
    return liassemps;
 }