module.exports = (sequelize, DataTypes) => {
    const dossiers = sequelize.define("dossiers", {
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        id_user: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        dossier: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: false
        },
        nif: {
            type: DataTypes.STRING(25),
            unique: true,
            allowNull: false
        },
        stat: {
            type: DataTypes.STRING(25),
            unique: true,
            allowNull: false
        },
        responsable: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: true
        },
        expertcomptable: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: true
        },
        cac: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: true
        },
        denomination: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: true
        },
        raisonsociale: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: true
        },
        rcs: {
            type: DataTypes.STRING(35),
            unique: false,
            allowNull: true
        },
        formejuridique: {
            type: DataTypes.STRING(10),
            unique: false,
            allowNull: true
        },
        activite: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: true
        },
        detailactivite: {
            type: DataTypes.STRING(250),
            unique: false,
            allowNull: true
        },
        adresse: {
            type: DataTypes.STRING(200),
            unique: false,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(150),
            unique: false,
            allowNull: true
        },
        telephone: {
            type: DataTypes.STRING(15),
            unique: false,
            allowNull: true
        },
        id_plancomptable: {
            type: DataTypes.BIGINT,
            unique: false,
            allowNull: true
        },
        longcomptestd: {
            type: DataTypes.INTEGER,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        longcompteaux: {
            type: DataTypes.INTEGER,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        autocompletion: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue: true
        },
        avecanalytique: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue: false
        },
        tauxir: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        pourcentageca: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        montantmin: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        assujettitva: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue: false
        },
        capital: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        nbrpart: {
            type: DataTypes.INTEGER,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        valeurpart: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        pourcentageca: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        montantmin: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        }
    }, { timestamps: true },)
    return dossiers
}