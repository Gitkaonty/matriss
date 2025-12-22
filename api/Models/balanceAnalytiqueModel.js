module.exports = (sequelize, DataTypes) => {
    const balanceanalytiques = sequelize.define("balanceanalytiques", {
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
        id_numcpt: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'dossierplancomptables',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        id_axe: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'caaxes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        id_section: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'casections',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        mvtdebitanalytique: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: true,
            defaultValue: 0
        },
        mvtcreditanalytique: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        soldedebitanalytique: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        soldecreditanalytique: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        valeuranalytique: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },
        rubriquebilanactifbrutanalytique: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 0
        },
        rubriquebilanactifamortanalytique: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 0
        },
        rubriquebilanpassifbrutanalytique: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 0
        },
        rubriquecrnanalytique: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 0
        },
        rubriquecrfanalytique: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 0
        },
        rubriquetftdanalytique: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 0
        },
        rubriquetftianalytique: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 0
        },
        soldedebittresoanalytique: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        soldecredittresoanalytique: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        }
    }, { timestamps: true },)
    return balanceanalytiques
}