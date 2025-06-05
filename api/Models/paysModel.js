//user model
const {Sequelize, DataTypes} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const pays = sequelize.define( "pays", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            autoIncrement:true,
            primaryKey:true
        },
        code: {
            type: DataTypes.STRING(5),
            unique: false,
            allowNull: false
        },
        nompays: {
            type: DataTypes.STRING(75),
            unique: false,
            allowNull: false
        },
    }, {timestamps: true}, )
    return pays;
 }