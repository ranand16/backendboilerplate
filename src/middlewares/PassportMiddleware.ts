import passport from "passport";
import passportJWT from "passport-jwt";
import Config from "config";
import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { logger, AuthInfoI } from "../library";

export default class PassportMiddleware {
    constructor(app: any) {
        app.use(
            passport.initialize(),
            (req: Request, res: Response, next: NextFunction) => {
                res.on("finish", () => {
                    logger.info(`Auth User:: "req.user":: ${(req.user as User)?.id}`);
                });
                next();
            }
        );
        this.setStrategy();
    }

    private setStrategy() {
        const JWTStrategy = passportJWT.Strategy;
        const ExtractJWT = passportJWT.ExtractJwt;

        passport.use(
            new JWTStrategy(
                {
                    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
                    secretOrKey: Config.get("JWT.AUTH_SECRET_KEY")
                },
                function (jwtPayload: AuthInfoI, done) {
                    console.log("jwtPayload",jwtPayload.user_id);
                    User.findByPk(jwtPayload.user_id)
                        .then((user: User) => {
                            console.log(`userJSON:: ${JSON.stringify(user.toJSON())}`);
                            if (!user) {
                                return done(null, false, {
                                    message: Config.get(
                                        "MESSAGES.USER.NOT_EXIST"
                                    ),
                                });
                            }
                            if (parseInt(user.deleted)) {
                                return done(null, false, {
                                    message:
                                        "Inactive User,Please contact support.",
                                });
                            }
                            
                            const userJSON: any = user.toJSON();
                            userJSON.jwtPayload = jwtPayload;
                            delete userJSON.password;
                            return done(null, userJSON, jwtPayload);
                        })
                        .catch((err) => {
                            console.log("jwt auth", err);
                            return done(err, false);
                        });
                }
            )
        );
    }
}
