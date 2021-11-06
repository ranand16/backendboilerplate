import { Model, DataTypes } from "sequelize";

import { database } from "./database";
import { Functions } from "../library";

/**
 * @todo We can plan to keep device id for more security point of view
 */
export class UserRefreshtoken extends Model {
    user_id!: number;
    token!: string;
    device_id!: string;
    // timestamps
    expire_date!: number;
    timecreated!: number;
    lasttimeupdated!: number;

    static async getByUser(userId: number) {
        const res = await UserRefreshtoken.findOne({
            where: {
                user_id: userId,
            }
        });
        return res;
    }

    static async getByToken(token: string) {
        const res = await UserRefreshtoken.findOne({
            where: {
                token: token,
            }
        });
        return res;
    }
}

UserRefreshtoken.init(
    {
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            unique: true,
            validate: { notEmpty: false },
            primaryKey: true
        },
        token: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "",
            validate: { notEmpty: false },
        },
        device_id: {
            type: DataTypes.STRING(500),
            allowNull: false,
            defaultValue: "",
        },
        expire_date: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: "timestamp",
        },
        timecreated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: Functions.currentTimestamp,
            comment: "timestamp",
        },
        lasttimeupdated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: "timestamp",
        }
    },
    {
        underscored: true,
        tableName: "user_refreshtoken",
        collate: "utf8mb4_unicode_ci",
        charset: "utf8mb4",
        engine: "InnoDB",
        sequelize: database, // this bit is important
        timestamps: false,
        // validate: {},
    }
);

// Below line will create table based on the above defination
// UserRefreshtoken.sync({ force: false }).then(() =>
//     console.log("user_refreshtoken table created")
// );
