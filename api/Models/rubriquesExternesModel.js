module.exports = (sequelize, DataTypes) => {
    const rubriquesExternes = sequelize.define("rubriquesexternes", {
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
        id_rubrique: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 0
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
        montantbrut: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        montantamort: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        montantnet: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        montantnetn1: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        variation: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        pourcentagen: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        pourcentagen1: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        pourcentagevariation: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        }
    }, { timestamps: true },)
    return rubriquesExternes;
}