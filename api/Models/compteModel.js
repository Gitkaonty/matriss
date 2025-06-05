//user model
module.exports = (sequelize, DataTypes) => {
    const userscomptes = sequelize.define( "userscomptes", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            autoIncrement:true,
            primaryKey:true
        },
        nom: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: false
        },
    }, {timestamps: true}, )
    return userscomptes
 }