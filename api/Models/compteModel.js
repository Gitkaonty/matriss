//user model
module.exports = (sequelize, DataTypes) => {
    const userscomptes = sequelize.define("userscomptes", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },
        nom: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(150),
            unique: true,
            isEmail: true,
            allowNull: true
        },
        raison_sociale: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        nif: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        stat: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        numero_telephone: {
            type: DataTypes.STRING(25),
            allowNull: true
        },
        type_abonnement: {
            type: DataTypes.STRING(25),
            allowNull: true
        },
    }, { timestamps: true },)
    return userscomptes
}