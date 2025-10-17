module.exports = (sequelize, DataTypes) => {
    const modeleplancomptabledetail = sequelize.define( "modeleplancomptabledetail", {
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_modeleplancomptable: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        compte: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        libelle: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        nature: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        baseaux: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        cptcharge: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue:0
        },
        typetier: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        cpttva: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue:0
        },
        nif: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        statistique: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        adresse: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        motcle: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        cin: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        datecin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        autrepieceid: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        refpieceid: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        adressesansnif: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        nifrepresentant: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        adresseetranger: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        pays: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        province: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        region: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        district: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        commune: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        baseaux_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
       
    }, {timestamps: true}, )

    modeleplancomptabledetail.associate = (models) => {
        modeleplancomptabledetail.belongsTo(models.modeleplancomptabledetail, {
            foreignKey: 'baseaux_id',
            as: 'baseaux'
        });
    };

    return modeleplancomptabledetail
 }