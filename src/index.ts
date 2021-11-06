/**
 * @author Rishabh Anand
 */
import "./envLoader";
// import "./library/Cache/redis";
import * as http from "http";
import Server from "./server";
import Config from "config";

const SERVER_CONFIG: any = Config.get('SERVER');

/**
 * Load application
 */
const app = Server.getApp();

/**
 * Configure application port
 */
const port = normalizePort(process.env.PORT);
app.set("port", port);

/**
 * Create Node-JS server
 */
const server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

server.keepAliveTimeout = SERVER_CONFIG.KEEP_ALIVE_TIMEOUT * 1000;
server.headersTimeout = SERVER_CONFIG.HEADERS_TIMEOUT * 1000; // This should be bigger than `keepAliveTimeout + your server's expected response time

/**
 * Valiadate application port
 * @param val number|string
 */
function normalizePort(val: number | string): number | string | boolean {
    // const httpPort: number = typeof val === "string" ? parseInt(val, 10) : val;
    const httpPort: number = 5000;
    if (isNaN(httpPort)) {
        return val;
    } else if (httpPort >= 0) {
        return httpPort;
    } else {
        return false;
    }
}

/**
 * Called when error occured while creating Node-Js server
 * @param error NodeJS.ErrnoException
 */
function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Called when Node-js server created successfully
 */
function onListening(): void {
    const addr = server.address();
    const bind =
        typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
}
