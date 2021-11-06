import { NextFunction, Request, Response, Application } from "express";
import * as express from "express";
import passport from "passport";

import UserController from "../controllers/UserController";

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from "../plugins/swagger";
import UserRoute from "./UserRoute";

/**
 * @todo - Need to create 2 different class, one for public access and another for protected(authentication required)
 */
export default class Index {
    constructor(app: any) {
        this.loadRoutes(app);
    }

    /**
     * Loads all different routes
     */
    public loadRoutes(app: Application) {
        // public routes
        app.use(express.static("public"));
        app.all("*", (req, res, next) => next());

        app.use((err: any, req: any, res: any, next: any) => {
            res.sendStatus(500).json(err);
        });
        // Base route
        app.get(
            ["/", "/dashboard"],
            (req: Request, res: Response, next: NextFunction) => {
                res.setHeader("Content-Type", "application/json");
                res.send({ status: 200, message: "Welcome, Success" });
            }
        );

        /**
         * @swagger
         * /v1/insertCheck:
         *   post:
         *     tags:
         *       - Server Test/Check
         *     summary: Used to check insert functionality working for server
         *     description: Used to check insert functionality working for server
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               f_name:
         *                 type: string
         *                 default: ''
         *                 description: User first name.
         *               l_name:
         *                 type: string
         *                 default: ''
         *                 description: User last name.
         *     responses:
         *       '200':
         *       description: Default response
        */
        app.post(
            "/v1/insertcheck",
            (req: Request, res: Response) =>
                new UserController().insertcheck(req, res)
        );

        /* Authentication is not required for login, signup */
        app.post(
            "/v1/signup",
            (req: Request, res: Response, next: NextFunction) =>
                new UserController().create(req, res)
        );
        
        /**
        * @swagger
        * /v1/login:
        *   post:
        *     tags:
        *       - Auth - Uable App
        *     summary: Used to do login with user credentials
        *     description: This API is used to do login with user credentials
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             properties:
        *               username:
        *                 type: string
        *                 default: ''
        *                 description: User name.
        *               email:
        *                 type: string
        *                 default: ''
        *                 description: User eamil.
        *               password:
        *                 type: string
        *                 description: User password.
        *                 default: ""
        *     responses:
        *       '200':
        *         description: Default response
        */
        app.post(
            "/v1/login",
            (req: Request, res: Response, next: NextFunction) =>
                new UserController().login(req, res, next)
        );

        app.post(
            "/v1/auth/check-email-or-username",
            (req: Request, res: Response, next: NextFunction) =>
                new UserController().checkEmailOrUserName(req, res)
        );

        app.get(
            "/v1/checkusername/:username",
            (req: Request, res: Response, next: NextFunction) =>
                new UserController().checkusername(req, res, next)
        );
        app.get(
            "/v1/checkemail/:email",
            (req: Request, res: Response, next: NextFunction) =>
                new UserController().checkemail(req, res, next)
        );

        app.use(
            "/v1/testauth",
            passport.authenticate("jwt", { session: false }),
            (req: Request, res: Response, next: NextFunction) => 
                new UserController().testauth(req, res, next)
        );

        app.use(
            "/v1/users",
            passport.authenticate("jwt", { session: false }),
            (req: Request, res: Response, next: NextFunction) => {
                return next();
            },
            new UserRoute().router
        );

        app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

        // Undefined Routes handler
        app.use("**", function (
            req: Request,
            res: Response,
            next: NextFunction
        ) {
            res.status(404);
            res.send({ status: 404, message: "Not Found" });
        });
    }
};
