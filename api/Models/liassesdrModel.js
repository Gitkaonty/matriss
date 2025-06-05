//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liassesdrs = sequelize.define( "liassesdrs", {
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
        exercice: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        solde_imputable: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        solde_non_imputable: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        total: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        niveau: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        ordre: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        nature: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
    }, {timestamps: true}, )
    return liassesdrs;
 }