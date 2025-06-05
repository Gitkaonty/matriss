//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liasseevcps = sequelize.define( "liasseevcps", {
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
        note: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        capitalsocial: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        primereserve: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        ecartdevaluation: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        resultat: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        report_anouveau: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        total_varcap: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        sensrubrique: {
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
        nature: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
    }, {timestamps: true}, )
    return liasseevcps;
 }