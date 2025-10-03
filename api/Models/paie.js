'use strict';
module.exports = (sequelize, DataTypes) => {
    const Paie = sequelize.define('paie', {
        personnelId:
        {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        matricule: {
            type: DataTypes.STRING,
            allowNull: true
        },
        salaireBase: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        prime: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        heuresSup: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        indemnites: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        remunerationFerieDimanche: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        salaireBrutNumeraire: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },

        assurance: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        carburant: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        entretienReparation: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        totalDepensesVehicule: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        totalAvantageNatureVehicule: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        loyerMensuel: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        remunerationFixe25: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        avantageNatureLoyer: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        depenseTelephone: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        avantageNatureTelephone: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        autresAvantagesNature: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        totalAvantageNature: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },

        salaireBrut20: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        cnapsEmployeur: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        baseImposable: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        ostieEmployeur: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        totalSalaireBrut: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        irsaBrut: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        deductionEnfants: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        irsaNet: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        salaireNet: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        avanceQuinzaineAutres: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        avancesSpeciales: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        allocationFamiliale: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        netAPayerAriary: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        partPatronalCnaps: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        partPatronalOstie: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        mois: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        annee: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        id_dossier: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'dossiers',
                key: 'id'
            }
        },
        id_exercice: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'exercices',
                key: 'id'
            }
        },
        id_compte: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'userscomptes',
                key: 'id'
            }
        }
    }, {
        tableName: 'paies',
        timestamps: true
    });

    Paie.associate = function (models) {
        Paie.belongsTo(models.personnel, { as: 'personnel', foreignKey: 'personnelId' });
    };

    return Paie;
};
