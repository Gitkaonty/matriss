const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const etatsDgeMatrices = sequelize.define("dgematrices", {
        id_dge: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
        },
        libelle: {
            type: DataTypes.STRING(250),
            unique: false,
            allowNull: false
        },
        groupe: {
            type: DataTypes.STRING(4),
            allowNull: true,
        },
        montant: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            unique: false,
            allowNull: false
        },
    }, { timestamps: true },)
    return etatsDgeMatrices;
}