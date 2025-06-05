//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liasseeiafncs = sequelize.define( "liasseeiafncs", {
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
        rubriques_poste: {
            type: DataTypes.STRING(50),
            allowNull: true,
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
        valeur_brute: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
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
    return liasseeiafncs;
 }