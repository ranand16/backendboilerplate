import { Model, DataTypes, Sequelize } from "sequelize";
import isEmail from "validator/lib/isEmail";
import RandExp from "randexp";

import { database } from "./database";

import Functions from "../library/utils/Functions";
import { HttpError } from "../library";

export class User extends Model {
    public id!: number;
    public pronoun:string;
    public firstname!: string;
    public lastname!: string;
    public displayname!: string;
    public username!: string;
    public password: string;
    public email!: string;
    public phone1: string;
    public gender: string;
    public dob: number;
    public bio : string;
    public city:string;
    public country:string;
    public address:string;
    public state:string;
    public picture:string;
    public timecreated: string;
    public created_by: string;
    public lasttimeupdated: string;
    public lastupdated_by: string;
    public deleted: string;
    public calling_code1:string;

}

function validateMobileNo(value: any) {
    if (value && !/^[+0-9]{3,15}$/.test(value)) {
        throw new HttpError(`"${value}" is not a valid mobile number.`);
    }
}

export const referralCodeGen = new RandExp(/[A-Z]{1}[0-9]{2}[a-z]{2}[A-Z]{1}/);

function validateUsername(username: string) {
    const data = { errorOccured: false, message: "" };

    if (username.length < 4) {
        data.errorOccured = true;
        data.message = `Username minimum length should be more than 3 characters.`;
        return data;
    }

    if (username.includes("@")) {
        data.errorOccured = true;
        data.message = `'@' is not allowed in username.`;
        return data;
    }

    if (username.startsWith(".") || username.startsWith("_")) {
        data.errorOccured = true;
        data.message = `'_' and '.' is not allowed at start of username.`;
        return data;
    }

    if (username.endsWith(".") || username.endsWith("_")) {
        data.errorOccured = true;
        data.message = `'_' and '.' is not allowed at end of username.`;
        return data;
    }

    return data;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        pronoun: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: "",
        },
        firstname: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "",
        },
        lastname: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "",
        },
        displayname: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "",
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            validate: {
                userNameMinLength(username, next) {
                    let validatedResult = { errorOccured: false, message: "" };

                    if (username) {
                        validatedResult = validateUsername(username);
                    }

                    if (validatedResult.errorOccured) {
                        return next(validatedResult.message);
                    }

                    next();
                },
                isUnique(username, next) {
                    if (!username) return next();
                    User.findOne({
                        where: {
                            username: Sequelize.where(
                                Sequelize.fn(
                                    "lower",
                                    Sequelize.col("username")
                                ),
                                Sequelize.fn("lower", username)
                            ),
                        },
                        attributes: ["id"],
                        raw: true,
                    })
                        .then((user) => {
                            if (user)
                                return next(
                                    `UserName "${username}" not available.`
                                );
                            next();
                        })
                        .catch(next);
                },
            },
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            validate: {
                validateEmail(email, next) {
                    if (!email) return next();
                    if (!isEmail(email))
                        return next(`"${email}" is not a valid email.`);
                    User.findOne({
                        where: {
                            email: Sequelize.where(
                                Sequelize.fn("lower", Sequelize.col("email")),
                                Sequelize.fn("lower", email)
                            ),
                        },
                        attributes: ["id"],
                        raw: true,
                    })
                        .then((user) => {
                            if (user)
                                return next(
                                    `Account with Email "${email}" already exists.`
                                );
                            next();
                        })
                        .catch(next);
                },
            },
        },
        phone1: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "",
            validate: {
                validateMobileNo,
            },
        },
        gender: {
            type: DataTypes.ENUM("M", "F", "O"),
            allowNull: true,
        },
        dob: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: "timestamp",
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "",
        },
        city: {
            type: DataTypes.STRING(45),
            allowNull: false,
            defaultValue: "",
        },
        country: {
            type: DataTypes.STRING(45),
            allowNull: false,
            defaultValue: "",
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "",
        },
        state: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "",
        },
        picture: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "",
        },
        timecreated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: Functions.currentTimestamp,
            comment: "timestamp",
        },
        created_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        lasttimeupdated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: Functions.currentTimestamp,
            comment: "timestamp",
        },
        lastupdated_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        deleted: {
            type: DataTypes.TINYINT({ length: 1 }),
            allowNull: false,
            defaultValue: 0,
            comment: "1-deleted, 0-active",
        },
        calling_code1: {
            type: DataTypes.STRING(45),
            allowNull: false,
            defaultValue: ""
        }
    },
    {
        underscored: true,
        tableName: "user",
        collate: "utf8mb4_unicode_ci",
        charset: "utf8mb4",
        engine: "InnoDB",
        sequelize: database, // this bit is important
        timestamps: false,
        validate: {
            registrationValid() {
                if (!this.username) throw new Error("Username field is required");
                if (!this.email) throw new Error("Email field is required");
                if (this.username) this.username = this.username.toLowerCase().trim();
                if (this.email) this.email = this.email.toLowerCase().trim();
            },
        },
    }
);

User.hasOne(User, {
    as: "createdBy",
    sourceKey: "created_by",
    foreignKey: "id",
});
