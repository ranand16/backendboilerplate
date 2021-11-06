import Config from "config";
import { Op as SQL_OP  } from "sequelize";
import JWT from "jsonwebtoken";
import {
    isPast,
    fromUnixTime,
} from "date-fns";
import BaseService from "./BaseService";

import {
    findOneInDB,
    HttpError,
    Functions,
    logger,
    verifyPasswordStrength,
} from "../library";

import {
    User,
} from "../models";
import { LoginHistory } from "../models/LoginHistory";
import { UserRefreshtoken } from "../models/UserRefreshtoken";
import { Insertcheck } from "../models/Insertcheck";

export default class UserService extends BaseService {
    constructor() {
        super();
    }

    /**
     * get all users from user DB
     */
    public async getUsers() {
        try {
            // Nodemailer.sendViaSesNodemailer("superbkumar@gmail.com", "TEst mail...", "<p><font  color='red'>Test email from tic_tac</font></p>");
            // Nodemailer.sendViaAwssdk();
            return User.findAll({
                attributes: { exclude: ["password"] },
                order: [["id", "DESC"]],
            });
        } catch (error) {
            logger.error({
                FUNCN: this.constructor.name + "@" + this.getUsers.name,
                PARAM: "",
                ERROR: error.message,
                TRACE: error.stack,
            });
            return this.promiseReject(error);
        }
    }

    /**
     * get single user irrespective of user type
     * @param params
     */
    public async getSingleUser(params: any) {
        try {
            let notValid = this.validateSingle(params.id, {
                presence: true,
                numericality: { onlyInteger: true, greaterThan: 0 },
            });
            if (notValid) {
                return this.throwValidationError(notValid);
            }
            const userId: number = params.id;
            return User.findByPk(userId, {
                attributes: { exclude: ["password"] },
            });
        } catch (error) {
            logger.error({
                FUNCN: this.constructor.name + "@" + this.getSingleUser.name,
                PARAM: params,
                ERROR: error.message,
                TRACE: error.stack,
            });
            return this.promiseReject(error);
        }
    }

    /**
     * check username is available or not
     * @param params {username}
     */
    public async checkUsername(params: any) {
        try {
            return User.count({
                where: { username: params.username },
            });
        } catch (error) {
            logger.error({
                FUNCN: this.constructor.name,
                PARAM: params,
                ERROR: error.message,
                TRACE: error.stack,
            });
            return this.promiseReject(error);
        }
    }

    /**
     * check email is available or not
     * @param params {email}
     */
    public async checkEmail(params: any) {
        try {
            return User.count({
                where: { email: params.email },
            });
        } catch (error) {
            logger.error({
                FUNCN: this.constructor.name,
                PARAM: params,
                ERROR: error.message,
                TRACE: error.stack,
            });
            return this.promiseReject(error);
        }
    }

    public async insertcheck(row: any) {
        try {
            let insertTable: Insertcheck;            
            insertTable = await Insertcheck.create(row);
            insertTable = insertTable.toJSON() as Insertcheck;
            return { newUser: insertTable };
        } catch (error) {
            this.logError(this.constructor.name, {  }, error);
            return this.promiseReject(error);
        }
    }

    /**
     *
     * If route is Signup, It's a self registration. So "registration_by" field value should be "self"
     * If Admin/Mentor/Parent creates user a/c, then "regsitration_by" is mandatory
     *      OR System can find the value based on their role/user type
     *
     *
     * @param row
     * @todo - Call setFieldsByUserType to set default fields based on user type
     */
    public async create(row: any) {
        try {
            const authUser = row?.user; // if this account is not self made, then the user creating the account will be authUser
            let encryptedPassword = "";
            row.created_by = false;
            verifyPasswordStrength(row.password);
            row.confirmed = 1;

            if (row.password) {
                encryptedPassword = Functions.encryptString(row.password);
                // hash the password
                row.password = await this.generateHash(row.password);
            }

            if (row.dob) {
                const dob = fromUnixTime(row.dob);
                if (!isPast(dob)) {
                    throw new HttpError(
                        `User DOB should be a valid past date.`,
                        400
                    );
                }
            }

            let user: User;            
            user = await User.create(row,{authInfo: this.getAuthInfo()});
            user = user.toJSON() as User;

            delete user.password;

            if (row.autoLogin) {
                LoginHistory.insertRow({
                    user_id: user.id,
                    headers: row.headers,
                    device_type: row.device_type,
                    ip: row.ip,
                });
                return { ...(await this.generateLoginJWT(user)), newUser: true };
            }

            return this.promiseResolve(user);
        } catch (error) {
            this.logError(this.constructor.name, { row }, error);
            return this.promiseReject(error);
        }
    }

    /**
     * Params required username/email, password
     * Fetch user record by username/email
     * Compare the password (need to hash the inputted password and compare with DB data) 
     * If failed, return with error message
     * If passed, genereate the JWT (with user data, id, name, email,......)
     *
     */
    public login(data: any, version : number = 1) {
        try {
            return this.validateLoginData(data).then(data =>
                this.processLogin(data, version),
                this.throwValidationError
            );
        } catch (error) {
            this.logError(this.constructor.name, { data }, error);
            return this.promiseReject(error);
        }
    }

    /**
     *
     * @param data
     */
    public async processLogin(data: any, version : number = 1) {
        try {
            const { device_id } = data;
            let conditions = {};
            if (data.username) {
                conditions = { where: { username: data.username } };
            }
            if (data.email) {
                conditions = { where: { email: data.email } };
            }

            
            const pwd: string = data.password;
            let user = await User.findOne(conditions);
            if (!user) {
                return super.promiseReject({
                    status: 404,
                    message: Config.get("MESSAGES.AUTH.USER_NOT_FOUND"),
                    errorClassObj: new Error(),
                });
            }
            if (parseInt(user.deleted)) {
                console.log("user.deleted");
                return super.promiseReject({
                    status: 404,
                    message: Config.get("MESSAGES.USER.NOT_ACTIVE"),
                    errorClassObj: new Error(),
                });
            }

            if (!user.password) {
                return super.promiseReject({
                    status: 404,
                    message: Config.get("MESSAGES.AUTH.PASSWORD_NOT_SET"),
                    errorClassObj: new Error(),
                });
            }

            //bcrypt comparison implementation for password
            if (!(await super.compareHash(pwd, user.password))) {
                console.log("password matching");
                return super.promiseReject({
                    status: 400,
                    message: Config.get("MESSAGES.AUTH.INVALID_PASSWORD"),
                    errorClassObj: new Error(),
                });
            }


            let jwtPayload = await this.generateLoginJWT(user);

            // async
            LoginHistory.insertRow({
                user_id: user.id,
                headers: data.headers,
                device_type: data.device_type,
                ip: data.ip,
            });

            return super.promiseResolve(jwtPayload);
        } catch (error) {
            this.logError(this.constructor.name, { data }, error);
            return this.promiseReject(error);
        }
    }

    private async generateLoginJWT(user: User, loggedInBy: number = 0) {

        //set JWT token data
        let jwtPayload = {
            user_id: user.id,
            firstname: user.firstname,
            username: user.username,
            email: user.email,
            ujwt: undefined,
            logged_in_by: loggedInBy,
        };

        //algorithm used default HS256
        const jwtToken = JWT.sign(
            jwtPayload,
            Config.get("JWT.AUTH_SECRET_KEY"),
            { expiresIn: Config.get("JWT.AUTH_EXPIRES_IN") }
        );
        jwtPayload.ujwt = jwtToken;
        return jwtPayload;
    }

    public validateLoginData(data: any): any {
        let constraints: any = {
            password: {
                presence: {
                    allowEmpty: false,
                    message: Config.get("MESSAGES.EMPTY"),
                },
            },
        };
        if (data.username) {
            constraints.username = {
                presence: {
                    allowEmpty: false,
                    message: Config.get("MESSAGES.EMPTY"),
                },
            };
        } else {
            constraints.email = {
                presence: {
                    allowEmpty: false,
                    message: Config.get("MESSAGES.EMPTY"),
                },
            };
        }
        return this.validator(data, constraints);
    }

    public async checkEmailOrUserName(data: any) {
        console.log(`data: ${JSON.stringify(data)}`);
        try {
            const { emailOrUserName } = data;
            const query = {
                where: {
                    [SQL_OP.or]: [
                        { email: emailOrUserName },
                        { username: emailOrUserName },
                    ]
                },
                // attributes: ["id"],
            };

            const user: User = await findOneInDB({
                model: User,
                query,
                ifNotFoundThrowError: false,
                raw: true,
            });

            return {
                exists: !!user,
                // emailVerified: !!user?.confirmed,
                // userType: user?.type || null,
            };
        } catch (error) {
            logger.error({
                FUNCN: this.constructor.name,
                QUERY: data,
                ERROR: error.message,
                TRACE: error.stack,
            });
            return this.promiseReject(error);
        }
    }

    public async logout() {
        try {
            const authInfo = this.getAuthInfo();
            if (!authInfo?.user_id) {
                throw new HttpError("Logged in user required");
            }

            const now = Functions.currentTimestamp();
            const refToken = await UserRefreshtoken.getByUser(authInfo?.user_id);
            if (refToken) {
                refToken.expire_date = now;
                refToken.lasttimeupdated = now;
                refToken.save({ authInfo })
            }else{
                throw new HttpError("Invalid User to logout");
            }

            return "ok";
        } catch (error) {
            this.logError(`${this.constructor.name}@${this.logout.name}`, {}, error);
            return this.promiseReject(error);
        }
    }
}
