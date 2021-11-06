
import swaggerJSDoc from 'swagger-jsdoc';
import Config from "config";

const isDevEnv = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const isTestEnv = process.env.NODE_ENV === 'test';
const isProdEnv = process.env.NODE_ENV === 'production';
const serviceUrl = Config.get("SERVICE.URL");

const swaggerEndpoints : any[] = [];

if (isDevEnv) {
    swaggerEndpoints.push({
        url: serviceUrl,
        description: 'Dev local server'
    });
} else if (isTestEnv) {
    swaggerEndpoints.push({
        url: serviceUrl,
        description: 'Staging  server',
    });
    swaggerEndpoints.push({
        url: 'http://localhost:8000',
        description: 'Dev local  server',
    });
} else if (isProdEnv) {
    swaggerEndpoints.push({
        url: serviceUrl,
        description: 'Prod server',
    });
}

const apis = isDevEnv ? ["src/routes/*.ts"] : ["dist/routes/*.js"];

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Baburao",
            description: "API Docs for Baburao Backend Service",
        },
        servers: swaggerEndpoints,
        components: {
            schemas: {},
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },

    // Paths to files containing OpenAPI definitions
    apis: apis,
};

export const swaggerSpec = swaggerJSDoc(options);