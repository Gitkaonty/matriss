module.exports = (sequelize, DataTypes) => {
    const consolidationCompte = sequelize.define("consolidationcompte", {
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
        id_dossier_autre: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'dossiers',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        id_numcpt_autre: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'dossierplancomptables',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
    }, {
        tableName: "consolidationcomptes",
        timestamps: true
    },)
    return consolidationCompte;
}