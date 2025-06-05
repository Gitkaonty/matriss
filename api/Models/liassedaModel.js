//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liassedas = sequelize.define( "liassedas", {
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
        rubriques_poste: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        date_acquisition: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        taux: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        valeur_acquisition: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        augmentation: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        diminution: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        amort_anterieur: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        dotation_exercice: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        amort_cumule: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        valeur_nette: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        libelle: {
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        num_compte: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue:0
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
    return liassedas;
 }