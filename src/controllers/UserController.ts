import { NextFunction, Request, Response, Router } from "express";
import StandardResponse from "../library/utils/Response";
import BaseController from "./BaseController";
import UserService from "../services/UserService";
const { API_AUTH_HEADER } = process.env;

export default class UserController extends BaseController {
    userService: UserService;
    constructor() {
        super({});
        this.userService = new UserService();
    }

    public getUsers(req: any, res: any, next: any) {
        this.userService
            .setAuthUser(req)
            .getUsers()
            .then((users) => {
                return new StandardResponse()
                    .success()
                    .set("data", users)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public getSingleUser(req: any, res: any, next: any) {
        this.userService
            .setAuthUser(req)
            .getSingleUser(req.params)
            .then((user) => {
                return new StandardResponse()
                    .success()
                    .set("data", user)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public checkusername(req: any, res: any, next: any) {
        console.log("checkusername invoked");
        this.userService
            .checkUsername(req.params)
            .then((count) => {
                return new StandardResponse()
                    .success()
                    .set("data", count)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public checkemail(req: any, res: any, next: any) {
        console.log("checkemail invoked");
        this.userService
            .checkEmail(req.params)
            .then((count) => {
                return new StandardResponse()
                    .success()
                    .set("data", count)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public login(req: any, res: any, next: any) {
        this.userService
            .login({ ...req.body, headers: req.headers, ip: req.ip })
            .then((user) => {
                return new StandardResponse()
                    .success()
                    .set("data", user)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }
    public checkEmailOrUserName(req: any, res: any) {
        this.userService
            .checkEmailOrUserName(req.body)
            .then((user) => {
                return new StandardResponse()
                    .success()
                    .set("data", user)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public insertcheck(req: any, res: any) {
        this.userService
            // .setAuthUser(req)
            .insertcheck({ ...req.body, headers: req.headers})
            .then((user) => {
                return new StandardResponse()
                    .success()
                    .set("data", user)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public create(req: any, res: any) {
        console.log(`Request is : ${req}`);
        this.userService
            .setAuthUser(req)
            .create({ ...req.body, headers: req.headers, ip: req.ip, user: req.user, type: req.body.type})
            .then((user) => {
                return new StandardResponse()
                    .success()
                    .set("data", user)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public logout(req: any, res: any) {
        this.userService
            .setAuthUser(req)
            .logout()
            .then((user) => {
                return new StandardResponse()
                    .success()
                    .set("data", user)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public testauth(req: any, res: any, next: any) {
        console.log("THIS IS DONE!!");
    }
}
