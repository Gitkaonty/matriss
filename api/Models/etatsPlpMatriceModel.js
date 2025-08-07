const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const etatsplpmatrices = sequelize.define("etatsplpmatrices", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },
        code_cn: {
            type: DataTypes.STRING(15),
            unique: false,
            allowNull: false
        },
        nature_produit: {
            type: DataTypes.STRING(250),
            unique: false,
            allowNull: false
        },
        unite_quantite: {
            type: DataTypes.STRING(50),
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        commercant_quantite: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        commercant_valeur: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        producteur_quantite: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        producteur_valeur: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        }
    }, { timestamps: true },)
    return etatsplpmatrices;
}