module.exports = (sequelize, DataTypes) => {
    const analytiques = sequelize.define("analytiques", {
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
        id_ligne_ecriture: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'journals',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        debit: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        credit: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        pourcentage: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
    }, {
        tableName: "analytiques",
        timestamps: true
    });
    return analytiques;
};
