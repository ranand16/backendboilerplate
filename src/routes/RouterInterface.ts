import {Router} from "express";

interface RouterInterface {
    router: Router;
    routes(): void;
    defaultRoutes(): void;
}

export default RouterInterface;