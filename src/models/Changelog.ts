import { Model, DataTypes } from "sequelize";
import { database } from "./database";
import { Functions } from "../library";

export class Changelog extends Model {
    logId: number;
    mainId: number;
    transitionType: string;
    transitionBy: number;
    transitionByEmail: string;
    tableName: string;
    tableId: number;
    fieldName: string;
    oldValue: string;
    newValue: string;
    transitionDate: number;
    ipaddress: string;
    user_agent: string;
}

Changelog.init(
    {
        logId: {
            type: DataTypes.INTEGER({ length: 11, unsigned: true }),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        mainId: {
            type: DataTypes.INTEGER({ length: 11, unsigned: true }),
            allowNull: false,
            defaultValue: 0,
            comment: "Keep mainId to track all changes of one entity",
        },
        transitionType: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: "",
        },
        transitionBy: {
            type: DataTypes.INTEGER({ length: 11, unsigned: true }),
            defaultValue: 0,
            allowNull: false,
        },
        transitionByEmail: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "",
        },
        tableName: {
            type: DataTypes.STRING(250),
            allowNull: false,
            defaultValue: "",
        },
        tableId: {
            type: DataTypes.INTEGER({ length: 11, unsigned: true }),
            defaultValue: 0,
            allowNull: false,
        },
        fieldName: {
            type: DataTypes.STRING(250),
            allowNull: false,
            defaultValue: "",
        },
        oldValue: {
            type: DataTypes.STRING(4000),
            allowNull: false,
            defaultValue: "",
        },
        newValue: {
            type: DataTypes.STRING(4000),
            allowNull: false,
            defaultValue: "",
        },
        transitionDate: {
            type: DataTypes.INTEGER({ length: 11, unsigned: true }),
            allowNull: false,
            defaultValue: Functions.currentTimestamp,
            comment: "timestamp",
        },
        ipaddress: {
            type: DataTypes.STRING(45),
            allowNull: false,
            defaultValue: "",
        },
        useragent: {
            type: DataTypes.STRING(2000),
            allowNull: false,
            defaultValue: "",
        },
    },
    {
        // underscored: false,
        tableName: "changelog",
        collate: "utf8mb4_unicode_ci",
        charset: "utf8mb4",
        engine: "InnoDB",
        sequelize: database, // this bit is important
        timestamps: false,
        // validate: {},
    }
);

// Below line will create table based on the above defination
// Changelog.sync({ force: false }).then(() =>
//     console.log("Changelog table created")
// );
