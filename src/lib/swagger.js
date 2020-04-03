import config from 'config';
const swaggerDefinition = {
    info: {
        title: 'Space One',
        version: 'v1.0.0',
        description: 'Web-Console APIs'
    },
    host: config.get('baseURL'),
    schemes: ['http', 'https'],
    basePath: '/',
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header'
        }
    },
    security: [
        { bearerAuth: [] }
    ],
    definitions: { }
};

const swaggerOptions = {
    swaggerDefinition,
    apis: ['./swagger/*.yaml']
};

export {
    swaggerOptions
};
