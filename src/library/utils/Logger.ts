import { createLogger, format, transports } from "winston";
import path from "path";

let file_path = path.join(__dirname, "../../../logs/app.log");

const { env: ENV } = process;
const FILE_LOG_LEVEL = ENV.FILE_LOG_LEVEL || "info";
const CONSOLE_LOG_LEVEL = ENV.CONSOLE_LOG_LEVEL || "debug";

// define the custom settings for each transport (file, console)
var options = {
    file: {
        level: FILE_LOG_LEVEL,
        filename: file_path,
        handleExceptions: true,
        json: true,
        // maxsize: 5242880, // 5MB
        // maxFiles: 5,
        //   colorize: false,
    },
    console: {
        level: CONSOLE_LOG_LEVEL,
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        // format.colorize(),
        format.json()
    ),
    transports: [
        new transports.File(options.file),
        new transports.Console(options.console),
    ],
    exitOnError: false,
});

export default logger;

export const logError = (fn: string, error: any, authInfo?: any, extra?: any) => {
	return logger.error({
		fn,
		ctx: authInfo?.user_id|| 'N/A',
		error,
		extras: extra || '',
	});
};