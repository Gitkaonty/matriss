//user model
const {Sequelize, DataTypes} = require('sequelize');
const rubriquesMatrices = require('./rubriquesMatriceModel');

module.exports = (sequelize, DataTypes) => {
    const liassenotes = sequelize.define( "liassenotes", {
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
        ref_note: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        commentaires: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        nature: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        tableau: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ordre: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
    }, {timestamps: true}, )
    return liassenotes;
 }