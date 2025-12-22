module.exports = (sequelize, DataTypes) => {
    const role = sequelize.define("roles", {
        code: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        nom: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: "roles",
        timestamps: true
    },)
    return role;
}