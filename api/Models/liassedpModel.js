//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liassedps = sequelize.define( "liassedps", {
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
        type_calcul: {
            type: DataTypes.STRING(10),
            allowNull: true,
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
        nature_prov: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        montant_debut_ex: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        augm_dot_ex: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        dim_repr_ex: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        diminution: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montant_fin: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        compte_associe: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        nature: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
    }, {timestamps: true}, )
    return liassedps;
 }