module.exports = (sequelize, DataTypes) => {
    const isi = sequelize.define("declisi", {
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'userscomptes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        id_dossier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'dossiers',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        id_exercice: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'exercices',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        id_numcpt: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'dossierplancomptables',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        id_ecriture: {
            type: DataTypes.STRING(25),
            unique: true,
            allowNull: false
        },
        nom: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        cin: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        nature_transaction: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        detail_transaction: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        date_transaction: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        montant_transaction: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        montant_isi: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        province: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        region: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        district: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        commune: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        fokontany: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        validite: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        anomalie: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        declisimois: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        declisiannee: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
    }, {
        tableName: "declisis",
        timestamps: true
    },)
    return isi;
}