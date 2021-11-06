import { Model, DataTypes } from "sequelize";
import { database } from "./database";

export class Insertcheck extends Model {
    id!: number;
    f_name: string;
    l_name: string;
}

Insertcheck.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        },
        f_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "no_name",
        },
        l_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "no_name",
        }
    },
    {
        underscored: true,
        tableName: "rishabh_test_table",
        collate: "utf8mb4_unicode_ci",
        charset: "utf8mb4",
        engine: "InnoDB",
        sequelize: database, // this bit is important
        timestamps: false,
        // validate: {},
    }
);