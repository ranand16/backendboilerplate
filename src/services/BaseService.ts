import { Request } from "express";
import validate from "validate.js";
import bcrypt from "bcrypt";
import Config from "config";

import { PromiseInterface } from "./ServiceInterface";
import { HttpError, logger, Auth, AuthInfoI } from "../library";
import { User } from "../models";

// export default class BaseService implements ServiceInterface {
export default class BaseService {
    loggedInUser: User;
    authInfo: AuthInfoI;
    
    protected throwValidationError(error: any, status = 400) {
        throw new HttpError(
            "Validation Error, " +
                Object.keys(error)
                    .map((key) => error[key])
                    .filter((v) => v)
                    .join(", "),
            status
        );
    }

    protected validateSingle(value: any, constraints: any) {
        return validate.single(value, constraints);
    }

    protected validateSingleAndThrowOnError(
        value: any,
        constraints: any,
        message?: string
    ) {
        const notValid = validate.single(value, constraints);
        if (notValid) {
            if (message) {
                throw new HttpError(message, 400);
            }

            return this.throwValidationError(notValid);
        }
    }

    protected async validator(
        data: any,
        constraints: any,
        formatAndthrowError = false,
        options: any = {}
    ) {
        options = { format: "flat", cleanAttributes: false, ...options };
        if (formatAndthrowError) {
            try {
                await validate.async(data, constraints, options);
            } catch (error) {
                throw new HttpError(
                    "Validation Error, " + error.join(", "),
                    400
                );
            }
        }

        return validate.async(data, constraints, options);
    }

    protected async generateHash(plaintxt: string): Promise<string> {
        return bcrypt.hash(plaintxt, Config.get("PWD_SALT_ROUND"));
    }

    protected async compareHash(
        plaintxt: string,
        pwdhash: string
    ): Promise<boolean> {
        return bcrypt.compare(plaintxt, pwdhash);
    }

    /**
     * setAuthUser
     * @param req Request
     *
     * return this - service Object
     */
    public setAuthUser(req: Request) {
        console.log(`req: ${req}`);
        this.loggedInUser = Auth.getLoggedInUser(req);
        this.authInfo = Auth.getAuthInfo(req);
        return this;
    }

    public setLoggedInUser(user: User) {
        this.loggedInUser = user;
        return this;
    }

    public setAuthInfo(authInfo: AuthInfoI) {
        this.authInfo = authInfo;
        return this;
    }

    protected getLoggedInUser() {
        if (!this.loggedInUser) {
            this.logError(
                this.getLoggedInUser.name,
                "",
                new Error("authUser not set, call setAuthUser() first")
            );
            return undefined;
        }
        return this.loggedInUser;
    }

    protected getAuthInfo() {
        if (!this.authInfo) {
            this.logError(
                this.getAuthInfo.name,
                "",
                new Error("authUser not set, call setAuthUser() first")
            );
            return undefined;
        }
        return this.authInfo;
    }

    protected throwPermissionDeniedError() {
        throw new HttpError(`Not Authorized to access this resource.`, 401);
    }

    protected promiseReject(reason: PromiseInterface | ErrorConstructor) {
        return Promise.reject(reason);
    }

    protected promiseResolve(value: any) {
        return Promise.resolve(value);
    }

    protected logError(serviceName: string, query: any, error: Error) {
        logger.error({
            FUNCN: serviceName,
            MESSAGE: error?.message || "",
            QUERY: query,
            ERROR: error,
        });
    }
}
