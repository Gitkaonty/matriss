module.exports = (sequelize, DataTypes) => {
    const dossierfiliales = sequelize.define( "dossierfiliales", {
        id_dossier: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        nom: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: true
        },
        dateentree: {
            type: DataTypes.DATE,
            unique: false,
            allowNull: true
        },
        datesortie: {
            type: DataTypes.DATE,
            unique: false,
            allowNull: true
        },
        nbrpart: {
            type: DataTypes.INTEGER,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        enactivite: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue:false
        },
    }, {timestamps: true}, )
    return dossierfiliales
 }