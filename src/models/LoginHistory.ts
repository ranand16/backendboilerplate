import { Model, DataTypes } from "sequelize";
import { UAParser } from "ua-parser-js";

import { database } from "./database";
import { Functions, logger } from "../library";

import { User } from "./User";

export class LoginHistory extends Model {
    public readonly id!: number;
    public ip!: string;
    public device_type: string;
    public browser_info: string;
    public user_id!: number;
    public status!: number;
    public logged_in_by!: number;

    // timestamps
    public timecreated!: number;
    public lasttimeupdated!: number;

    // foreign keys
    public created_by: number;
    public lastupdated_by: number;

    static async insertRow(row: any) {
        try {
            const { headers, device_type, user_id, ip, logged_in_by } = row;
            const user = await User.findByPk(user_id);
            const ua = new UAParser(headers["user-agent"]);
            // console.log("ua", ua.getResult());

            const browser_info = JSON.stringify({
                ...ua.getResult(),
            });

            let dt = device_type;
            if (!dt) {
                const uaDevice = ua.getDevice();
                dt = Object.keys(uaDevice)
                    .filter((key) => uaDevice[key])
                    .map((key) => uaDevice[key]`${key}: ${uaDevice[key]}`)
                    .join(", ");
            }
            //Disabled hooks here
            const lh = await LoginHistory.create({
                device_type: dt,
                user_id,
                ip,
                browser_info,
                created_by: user_id,
                logged_in_by
            },{hooks:false});
            // user.lastlogin = lh.timecreated;
            // user.lastip = lh.ip;
            // user.last_firstaccess = lh.timecreated;
            //Disabled hooks here
            await user.save({hooks:false});
            // console.log("lh", lh.dataValues);
        } catch (error) {
            logger.error(
                `LoginHistory::insertRow ${JSON.stringify(error.message)}`
            );
        }
    }
}

LoginHistory.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        ip: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "",
        },
        browser_info: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        device_type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        logged_in_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.TINYINT({ length: 1 }),
            allowNull: false,
            defaultValue: 1,
        },
        timecreated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: Functions.currentTimestamp,
            comment: "this is timestamp in sec",
        },
        lasttimeupdated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: "this is timestamp in sec",
        },
    },
    {
        underscored: true,
        tableName: "login_history",
        collate: "utf8mb4_unicode_ci",
        charset: "utf8mb4",
        engine: "InnoDB",
        sequelize: database, // this bit is important
        timestamps: false,
        // validate: {},
    }
);

LoginHistory.belongsTo(User, { as: "user", foreignKey: "user_id" });
User.hasMany(LoginHistory, {
    as: "login_history",
    sourceKey: "id",
    foreignKey: "user_id",
});