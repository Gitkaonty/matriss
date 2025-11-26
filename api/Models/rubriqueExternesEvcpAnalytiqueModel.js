module.exports = (sequelize, DataTypes) => {
    const rubriquesexternesevcpanalytiques = sequelize.define("rubriquesexternesevcpanalytiques", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            autoIncrement: true,
            primaryKey: true
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
            defaultValue: 0,
            references:
            {
                model: 'rubriquesmatrices',
                key: 'id_rubrique'
            }
        },
        libelle: {
            type: DataTypes.STRING(250),
            allowNull: false,
            defaultValue: 0
        },
        id_etat: {
            type: DataTypes.STRING(25),
            allowNull: false,
            defaultValue: 0
        },
        note: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        capitalsocial: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        primereserve: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        ecartdevaluation: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        resultat: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        report_anouveau: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        total_varcap: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        sensrubrique: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        ordre: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        niveau: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        nature: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
    }, { timestamps: true },)
    return rubriquesexternesevcpanalytiques;
}