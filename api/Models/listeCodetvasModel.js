module.exports = (sequelize, DataTypes) => {
    const listecodetvas = sequelize.define( "listecodetvas", {
        code: {
            type: DataTypes.STRING(10),
            unique: false,
            allowNull: true
        },
        nature: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        libelle: {
            type: DataTypes.STRING(200),
            unique: false,
            allowNull: true
        },
    }, {timestamps: true}, )
    return listecodetvas
 }