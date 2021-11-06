/**
 * @author Rishabh Anand
 */
import * as bodyParser from "body-parser";
import Functions from "./library/utils/Functions";
// enable/ disable debugging
Functions.enableDebug(process.env.DEBUG);
import express from "express";
import AppRoutes from "./routes/Index";
import cors from "cors";
// import firebase from "firebase";
import StandardResponse from "./library/utils/Response";
import logger from "./library/utils/Logger";

import PassportMiddleware from "./middlewares/PassportMiddleware";

import compression from "compression";

/**
 * Server/Application class - follows singleton pattern
 * Configs are load,
 * Routes are loaded,
 * Session configuration is set
 * and db connections established
 */
class Server {
    public static selfInstance: Server = null;
    public static app: express.Application = null;
    public static config: any = null;
    public static logger: any = null;

    /**
     * Returns the instance of this class
     */
    public static getInstance() {
        if (Server.selfInstance) {
            return Server.selfInstance;
        }
        console.log("server instance created");
        return new Server();
    }

    /**
     * private constructor
     */
    private constructor() {
        Server.app = express();
        this.init();
    }

    /**
     * application config
     */
    public init(): void {
        this.loadMiddlewares(); // load all required middlewares
        this.loadRoutes(); // load all routes
        // handle any internal server error
        Server.app.use(function (err: any, req: any, res: any, next: any) {
            if (!err) {
                return next();
            }
            logger.error("Internal server error", err);
            return new StandardResponse()
                .error()
                .set("status", 500)
                .set("errorMsg", "Oops, something went wrong.")
                .send(res);
        });        
    }

    /**
     * Returns the root application
     */
    public getApp(): express.Application {
        return Server.app;
    }

    /**
     * returns the application level config
     */
    public getConfig(): any {
        return Server.config;
    }

    /**
     * Gets the logger class object
     */
    public getLogger() {
        return Server.logger;
    }

    /**
     * Loads aplication routes
     */
    public loadRoutes(): void {
        const Approutes = new AppRoutes(Server.app);
    }

    /**
     * This loads the middlewares
     */
    private loadMiddlewares(): void {
        Server.app.use(compression());
        Server.app.use(cors());
        Server.app.use(bodyParser.json());
        Server.app.use(bodyParser.urlencoded({ extended: true }));
        //load passport
        new PassportMiddleware(Server.app);
        Server.app.options("/*", function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
                "Access-Control-Allow-Methods",
                "GET,PUT,POST,DELETE,OPTIONS"
            );
            res.header(
                "Access-Control-Allow-Headers",
                "Content-Type, Authorization, Content-Length, X-Requested-With"
            );
            res.send(200);
        });
    }
}
// export
export default Server.getInstance();
