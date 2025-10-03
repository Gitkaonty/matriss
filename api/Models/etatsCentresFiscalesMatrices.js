const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const etatsCentresFiscalesmatrices = sequelize.define("etatscentresfiscalesmatrices", {
        id_cfisc: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
        },
        libelle: {
            type: DataTypes.STRING(250),
            unique: false,
            allowNull: false
        },
        montant: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            unique: false,
            allowNull: false
        },
    }, { timestamps: true },)
    return etatsCentresFiscalesmatrices;
}