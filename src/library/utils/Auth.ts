import { Request } from "express";
import { User } from "../../models";

export interface AuthInfoI {
    user_id: any;
    email: string;
    role: any;
    type: any;
    exp: any;
    iat: any;
    is_root: any;
    _user: User;
    _userAgent: string;
    _ipAddress: string;
    _req: Request;
    _deviceId: string;
    _deviceType: string;
    _clientName: string
}

export class Auth {
    /**
     * set IP, UserAgent in req.authInfo
     * this.setClientData(req);
     * @param req
     */
    public static setClientData(req: Request) {
        if (req.authInfo) {
            req.authInfo["_userAgent"] = req.get("user-agent");
            req.authInfo["_ipAddress"] = req.ip;
            req.authInfo["_deviceId"] = req.header('deviceId');
            req.authInfo["_deviceType"] = req.header('deviceType');
            req.authInfo["_clientName"] = req.header('ClientName');
            //@todo - we can store email from req.user.email, if we remove email from JWT
        }
    }
    public static getLoggedInUser(req: Request) {
        return req.user as User;
    }

    public static getAuthInfo(req: Request) {
        return req.authInfo as AuthInfoI;
    }
}