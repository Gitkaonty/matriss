module.exports = (sequelize, DataTypes) => {
    const modeleplancomptabledetailcpttva = sequelize.define( "modeleplancomptabledetailcpttva", {
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        id_modeleplancomptable: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        id_detail: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        compte: {
            type: DataTypes.STRING,
            allowNull: true
        },
        libelle: {
            type: DataTypes.STRING,
            allowNull: true
        },
        id_comptecompta: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
    }, {timestamps: true},)
    return modeleplancomptabledetailcpttva
 }