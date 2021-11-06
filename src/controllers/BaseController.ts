import { Request, Response } from "express";
import StandardResponse from "../library/utils/Response";
import ControllerInterface from "./ControllerInterface";
import { ServiceInterface } from "../services/ServiceInterface";

export default class BaseController implements ControllerInterface {
    service: Partial<ServiceInterface>;
    constructor(service: Partial<ServiceInterface>) {
        this.service = service;
    }

    public create(req: Request, res: Response) {
        this.service
            .setAuthUser(req)
            .create(req.body)
            .then((reslt) => {
                return new StandardResponse()
                    .success()
                    .set("data", reslt)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public update(req: Request, res: Response) {
        this.service
            .setAuthUser(req)
            .update(req.params, req.body)
            .then((reslt) => {
                if (reslt[0]) {
                    return new StandardResponse()
                        .success()
                        .set("data", reslt)
                        .send(res);
                } else {
                    return new StandardResponse().notfound().send(res);
                }
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public getAll(req: Request, res: Response) {
        this.service
            .setAuthUser(req)
            .getAll()
            .then((reslt) => {
                return new StandardResponse()
                    .success()
                    .set("data", reslt)
                    .send(res);
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }

    public getSingle(req: Request, res: Response) {
        console.log("req.params", req.params);
        this.service
            .setAuthUser(req)
            .getSingle(req.params, req.query)
            .then((reslt: any | null) => {
                if (reslt) {
                    return new StandardResponse()
                        .success()
                        .set("data", reslt)
                        .send(res);
                } else {
                    return new StandardResponse().notfound().send(res);
                }
            })
            .catch((err) => {
                return new StandardResponse().reasonHandler(err).send(res);
            });
    }
}
