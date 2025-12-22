module.exports = (sequelize, DataTypes) => {
    const permission = sequelize.define("permissions", {
        nom: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        code: {
            type: DataTypes.STRING(25),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: "permissions",
        timestamps: true
    },)
    return permission;
}