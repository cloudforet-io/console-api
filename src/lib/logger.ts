import config from 'config';
import httpContext from 'express-http-context';
import { clone } from 'lodash';
import winston from 'winston';
import * as Transport from 'winston-transport';

/* Configs */
const isProd = process.env.NODE_ENV === 'production';
const loggerConfig = config.get('logger');
interface Handler {
    type?: 'console'|'file';
    level?: string;
    path?: string;
    format?: string;
}
const handlers: Handler[] = loggerConfig.handlers || [];

/* Formatting */
const userMetaFormat = winston.format((info) => {
    info['request_url'] = httpContext.get('request_url');
    info['request_method'] = httpContext.get('request_method');
    info['tnx_id'] = httpContext.get('transaction_id');
    info['user_id'] = httpContext.get('user_id') || 'anonymous';
    info['domain_id'] = httpContext.get('domain_id') || '';
    return info;
});
const colorizer = winston.format.colorize();
const printFormat = winston.format.printf((info) => {
    if (isProd) return `${info.timestamp} [${info.level.toUpperCase()}] ${info.tnx_id} ${info.user_id} ${info.request_method} ${info.request_url} ${info.message}`;
    return `${colorizer.colorize(
        info.level, `${info.timestamp} [${info.level.toUpperCase()}]`)} ${info.tnx_id} ${info.user_id} ${info.request_method} ${info.request_url} ${info.message}`;
});
const stringifyJson = (data) => {
    return isProd ? JSON.stringify(data) : JSON.stringify(data, undefined, 2);
};


/* Transports */
const getConsoleTransport = (handler: Handler): Transport => new winston.transports.Console({
    level: handler.level || 'info',
    format: winston.format.combine(
        userMetaFormat(),
        winston.format.timestamp(),
        (handler.format == 'json')? winston.format.json(): printFormat
    )
});
const getFileTransport = (handler: Handler): Transport => new winston.transports.File({
    level: handler.level || 'info',
    filename: handler.path,
    //maxsize: ((handler.maxSize || 20) * 1024 * 1024),
    //maxFiles: handler.maxFiles || 10,
    tailable: true,
    format: winston.format.combine(
        userMetaFormat(),
        winston.format.timestamp(),
        (handler.format == 'json')? winston.format.json(): printFormat
    )
});

const transports = handlers.reduce((results, handler) => {
    if (handler.type == 'console') {
        results.push(getConsoleTransport(handler));
    } else if (handler.type == 'file' && handler.path) {
        results.push(getFileTransport(handler));
    }
    return results;
}, [] as Transport[]);


/* Loggers */
const logger = winston.createLogger({
    transports
});
const requestLogger = () => {
    return (req, res, next) => {
        const start = Date.now();
        let parameter = {};

        if (req.method == 'GET') {
            parameter = clone(req.query);
        } else if (req.method == 'POST') {
            parameter = clone(req.body);
        }

        const requestMeta = {
            parameter: parameter,
            request: {
                client: req.headers['x-real-ip'] || req.connection.remoteAddress,
                http_version: req.httpVersion,
                content_length: req.headers['content-length']
            }
        };

        res.on('finish', () => {
            if (res.statusCode == 200) {
                const responseMeta = {
                    status_code: res.statusCode,
                    response: {
                        content_length: res._contentLength,
                        response_time: (Date.now() - start)
                    }
                };
                if (!loggerConfig.exclude || loggerConfig.exclude.indexOf(httpContext.get('request_url')) < 0) {
                    logger.info(`(Response) => Status: ${responseMeta.status_code}, 
                    Response Time: ${responseMeta.response.response_time} ms, Content Length: ${responseMeta.response.content_length}`, responseMeta);
                }
            }
        });

        if (!loggerConfig.exclude || loggerConfig.exclude.indexOf(httpContext.get('request_url')) < 0) {
            logger.info(`(Request) => ${stringifyJson(requestMeta.parameter)}`, requestMeta);
        }

        next();
    };
};
const errorLogger = () => {
    return (err, req, res, next) => {
        const errorMeta = {
            status_code: err.status || 500,
            error: {
                message: err.details || err.message,
                code: err.error_code || 'ERROR_UNKNOWN',
                stack: err.stack
            }
        };
        logger.error(`(Error) => Status: ${errorMeta.status_code}\n${errorMeta.error.stack}`, errorMeta);
        next(err);
    };
};

export default logger;
export {
    logger,
    requestLogger,
    errorLogger
};
