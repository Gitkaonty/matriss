module.exports = (sequelize, DataTypes) => {
    const ajustements = sequelize.define( "ajustements", {
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_dossier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_exercice: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_etat: {
            type: DataTypes.STRING(25),
            unique: false,
            allowNull: true
        },
        id_rubrique: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        nature: {
            type: DataTypes.STRING(25),
            unique: false,
            allowNull: true
        },
        motif: {
            type: DataTypes.STRING(50),
            unique: false,
            allowNull: true
        },
        montant: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue:0
        },
        
    }, {timestamps: true}, )

    return ajustements
 }