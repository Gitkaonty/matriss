//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liassesads = sequelize.define( "liassesads", {
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
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        n6: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        n5: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        n4: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        n3: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        n2: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        n1: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        n: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        total_imputation: {
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
    return liassesads;
 }