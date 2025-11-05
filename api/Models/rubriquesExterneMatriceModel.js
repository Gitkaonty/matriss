module.exports = (sequelize, DataTypes) => {
    const rubriquesExternesMatrices = sequelize.define("rubriquesexternesmatrices", {
        id_rubrique: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 0,
        },
        id_etat: {
            type: DataTypes.STRING(25),
            allowNull: false,
            defaultValue: 0
        },
        libelle: {
            type: DataTypes.STRING(250),
            allowNull: false,
            defaultValue: 0
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 0
        },
        ordre: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        subtable: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        par_default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    }, { timestamps: true },)
    return rubriquesExternesMatrices;
}