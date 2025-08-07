module.exports = (sequelize, DataTypes) => {
    const caSections = sequelize.define("casections", {
        section: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        intitule: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        compte: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        pourcentage: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        par_defaut: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        fermer: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
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
        id_axe: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'caaxes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    }, {
        tableName: "casections",
        timestamps: true
    });
    return caSections;
};
