import { NextFunction, Request, Response } from "express";
import UserController from "../controllers/UserController";
import BaseRoute from "./BaseRoute";

export default class UserRoute extends BaseRoute{
    
    userController: UserController = new UserController();
    constructor() {
        super();
    }

    public routes() {
       this.router.get("/:id(\\d+)", (req: Request, res: Response, next: NextFunction) => this.userController.getSingleUser(req, res, next)); 
       this.router.get("/", (req: Request, res: Response, next: NextFunction) => this.userController.getUsers(req, res, next)); 
    }
}