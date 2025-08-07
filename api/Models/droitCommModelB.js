module.exports = (sequelize, DataTypes) => {
    const droitcommbs = sequelize.define("droitcommbs", {
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
            defaultValue: 0,
            references: {
                model: 'exercices',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        nom: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        prenom: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        nif: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        nif_representaires: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        num_stat: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        cin: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        date_cin: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        lieu_cin: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        nature_autres: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        reference: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        raison_sociale: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        nom_commercial: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        fokontany: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        adresse: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        ville: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        ex_province: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        pays: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        nature: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        mode_payement: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        montanth_tva: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        tva: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        typeTier: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, { timestamps: true },)
    return droitcommbs
}