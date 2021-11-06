export class HttpError extends Error {
    status: number;
    httpStatus: number;
    extras: any;

    constructor(message: string, httpStatus: number = 400, extras?: any) {
        super(message);
        this.status = httpStatus;
        this.httpStatus = httpStatus;
        this.extras = extras;
    }
}
