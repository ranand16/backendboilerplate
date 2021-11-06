import { resolve } from "path";
import { existsSync } from "fs";
import dotenv from "dotenv";

const node_env = process.env.NODE_ENV;
const cwd = process.cwd();

const envs = [
    resolve(cwd, `.env.${node_env}`),
    resolve(cwd, `.${node_env}.env`),
    resolve(cwd, ".env"),
    resolve(cwd, ".env.local"),
].filter((filename) => existsSync(filename));

const envFile = envs?.[0];
if (envFile) dotenv.config({ path: envFile });

if (!node_env) console.warn("NODE_ENV is not set.");
else console.log(`NODE_ENV:: ${node_env}`);