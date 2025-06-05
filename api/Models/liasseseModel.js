//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liasseses = sequelize.define( "liasseses", {
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
        liste_emprunteur: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        date_contrat: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        duree_contrat: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        montant_emprunt: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montant_interet: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montant_total: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        date_disposition: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        montant_rembourse_capital: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        montant_rembourse_interet: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        solde_non_rembourse: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        date_remboursement: {
            type: DataTypes.DATE,
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
    return liasseses;
 }