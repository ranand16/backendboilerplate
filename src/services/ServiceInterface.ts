export interface PromiseInterface {
    status: number;
    message: string;
    errorClassObj?: Error;
    code?: string;
    data?:any;
}

export interface ServiceInterface {
    create?: any;
    update?: any;
    getAll?: any;
    getSingle?: any;
    [key: string]: any;
}
