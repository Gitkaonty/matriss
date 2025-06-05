module.exports = (sequelize, DataTypes) => {
    const journals = sequelize.define( "journals", {
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false
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
        id_ecriture: {
            type: DataTypes.STRING(25),
            unique: false,
            allowNull: true
        },
        datesaisie: {
            type: DataTypes.DATE,
            unique: false,
            allowNull: true
        },
        dateecriture: {
            type: DataTypes.DATE,
            unique: false,
            allowNull: false
        },
        id_journal: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_numcpt: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue:0
        },
        id_numcptcentralise: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        piece: {
            type: DataTypes.STRING(50),
            unique: false,
            allowNull: true
        },
        piecedate: {
            type: DataTypes.DATE,
            unique: false,
            allowNull: true
        },
        libelle: {
            type: DataTypes.STRING(50),
            unique: false,
            allowNull: true
        },
        debit: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        credit: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        devise: {
            type: DataTypes.STRING(10),
            unique: false,
            allowNull: false
        },
        lettrage: {
            type: DataTypes.STRING(10),
            unique: false,
            allowNull: true
        },
        lettragedate: {
            type: DataTypes.DATE,
            unique: false,
            allowNull: true
        },
        saisiepar: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        modifierpar: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
    }, {timestamps: true}, )
    return journals
 }