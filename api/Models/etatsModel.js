//user model
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const etats = sequelize.define("etats", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        id_dossier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        id_exercice: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        code: {
            type: DataTypes.STRING(15),
            unique: false,
            allowNull: false
        },
        nom: {
            type: DataTypes.STRING(250),
            unique: false,
            allowNull: false
        },
        ordre: {
            type: DataTypes.INTEGER,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        valide: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue: false
        },
        nbranomalie: {
            type: DataTypes.INTEGER,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        anomalies_valides: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue: false
        },
    }, { timestamps: true },)
    return etats;
}