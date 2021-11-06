import { response } from "express";
import { PromiseInterface } from "../../services/ServiceInterface";
import { HttpError } from "../../library";

class Response {
    /**
     * Standard success response
     */
    private s: any = {
        status: 200,
        statusMsg: "OK",
        data: "",
    };
    /**
     * Standard error response
     */
    private e: any = {
        status: 400,
        statusMsg: "Failed",
        data: "",
        message: "Something Went Wrong",
    };
    /**
     * Standard notfound response
     */
    private nf: any = {
        status: 404,
        statusMsg: "Failed",
        data: "",
        message: "Record not found",
    };

    private resHeader: any = {
        "content-type": "application/json",
    };

    // current response
    private resData: any = null;

    // set success response
    public success(): any {
        this.resData = this.s;
        return this;
    }

    // set error response
    public error(): any {
        this.resData = this.e;
        return this;
    }

    public notfound(): any {
        this.resData = this.nf;
        return this;
    }

    /**
     *
     * @param reason
     * @todo - we can do logging here. It would single place for all error logging
     */
    public reasonHandler(reason: PromiseInterface | Error) {
        this.error();
        if (reason instanceof HttpError) {
            this.set("status", reason.status).set("message", reason.message).setErrorDetails(reason);
        } else if (reason instanceof Error) {
            this.set("message", reason.message).setErrorDetails(reason);
        } else {
            this.set("status", reason.status).set("message", reason.message);
            if (reason.errorClassObj) {
                this.setErrorDetails(reason.errorClassObj);
            }
            if (reason?.data) {
                this.set("data", reason.data)
            }
        }
        return this;
    }

    private setErrorDetails(errorClassObj: Error) {
        let errorDetails: any = {};
        if (errorClassObj.message) {
            errorDetails["ererrorMsg"] = errorClassObj.message;
        }
        errorDetails["errorStack"] = errorClassObj.stack;
        this.set("errorDetails", errorDetails);
    }

    // set key and value in response
    public set(key: string, value: any): any {
        this.resData[key] = value;
        return this;
    }
    // get response
    public get(key: string): any {
        return this.resData[key] ? this.resData[key] : false;
    }

    public send(res: any = null): any {
        if (!res) {
            res = response;
        }
        res.status(this.resData.status).set(this.resHeader).json(this.resData);
    }
}

export default Response;