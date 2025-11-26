module.exports = (sequelize, DataTypes) => {
    const ajustementexternesanalytiques = sequelize.define("ajustementexternesanalytiques", {
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
        id_etat: {
            type: DataTypes.STRING(25),
            unique: false,
            allowNull: true
        },
        id_rubrique: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 0
        },
        nature: {
            type: DataTypes.STRING(25),
            unique: false,
            allowNull: true
        },
        motif: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        montant: {
            type: DataTypes.DOUBLE,
            unique: false,
            allowNull: false,
            defaultValue: 0
        },

    }, { timestamps: true },)

    return ajustementexternesanalytiques
}