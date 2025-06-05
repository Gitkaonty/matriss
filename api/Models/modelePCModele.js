module.exports = (sequelize, DataTypes) => {
    const modelePlanComptable = sequelize.define( "modelePlanComptable", {
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        nom: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        pardefault: {
            type: DataTypes.BOOLEAN,
        }
    }, {timestamps: true}, )
    return modelePlanComptable
 }