import express, { Request } from "express";

import RouteInterface from "./RouterInterface";

export default abstract class BaseRoute implements RouteInterface {
    public router: express.Router;
    _publicRouter: express.Router;

    constructor() {
        this.router = express.Router();
        this.routes();
        this.defaultRoutes();
    }

    get publicRouter() {
        if (!this._publicRouter) this._publicRouter = express.Router();
        return this._publicRouter;
    }

    public defaultRoutes(): void {}

    public routes(): void {}

    protected getServiceDTO(req: Request): any {
        return {
            body: req.body,
            query: req.query,
            params: req.params,
            authInfo: req.authInfo as any,
            authUser: req.user as any,
        };
    }
}
