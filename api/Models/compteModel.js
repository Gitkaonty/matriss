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
    }, { timestamps: true },)
    return userscomptes
}