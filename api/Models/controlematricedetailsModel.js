module.exports = (sequelize, DataTypes) => {
    const controlematricedetails = sequelize.define( "controlematricedetails", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            autoIncrement:true,
            primaryKey:true
        },
        declaration: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        etat_id: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        control_id: {
            type: DataTypes.INTEGER,
            unique: false,
            defaultValue:0
        },
        subtable: {
            type: DataTypes.INTEGER,
            unique: false,
            defaultValue:0
        },
        tablename: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        tableau: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        ligne: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        colonnefiltre: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        colonnetotal: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        exercice: {
            type: DataTypes.STRING(5),
            unique: false,
            allowNull: true
        },
        operation: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
    }, {timestamps: true}, )
    return controlematricedetails
 }