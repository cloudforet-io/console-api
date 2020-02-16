import winston from 'winston';
import _ from 'lodash';
import httpContext from 'express-http-context';
import config from 'config';

const loggerConfig = config.get('logger');

const userMetaFormat = winston.format((info, opts) => {
    info['request_url'] = httpContext.get('request_url');
    info['request_method'] = httpContext.get('request_method');
    info['tnx_id'] = httpContext.get('transaction_id');
    info['user_id'] = httpContext.get('user_id') || 'anonymous';
    info['domain_id'] = httpContext.get('domain_id') || '';
    return info;
});

const printFormat = winston.format.printf((info) => {
    return `${info.timestamp} [${info.level.toUpperCase()}] ${info.tnx_id} ${info.user_id} ${info.request_method} ${info.request_url} ${info.message}`;
});

const handlers = loggerConfig.handlers || [];
const transports = [];

handlers.map((handler) => {
    if (handler.type == 'console') {
        transports.push(new winston.transports.Console({
            level: handler.level || 'info',
            format: winston.format.combine(
                userMetaFormat(),
                winston.format.timestamp(),
                (handler.format == 'json')? winston.format.json(): printFormat
            )
        }));
    } else if (handler.type == 'file' && handler.path) {
        transports.push(new winston.transports.File({
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
        }));
    }
});

const logger = winston.createLogger({
    transports: transports
});

const requestLogger = () => {
    return (req, res, next) => {
        let start = Date.now();
        let parameter = {};

        if (req.method == 'GET') {
            parameter = _.clone(req.query);
        } else if (req.method == 'POST') {
            parameter = _.clone(req.body);
        }

        let requestMeta = {
            parameter: parameter,
            request: {
                client: req.headers['x-real-ip'] || req.connection.remoteAddress,
                http_version: req.httpVersion,
                content_length: req.headers['content-length']
            }
        };

        res.on('finish', () => {
            if (res.statusCode == 200) {
                let responseMeta = {
                    status_code: res.statusCode,
                    response: {
                        content_length: res._contentLength,
                        response_time: (Date.now() - start)
                    }
                };
                logger.info(`(Response) => Status: ${responseMeta.status_code}, Response Time: ${responseMeta.response.response_time} ms, Content Length: ${responseMeta.response.content_length}`, responseMeta);
            }
        });

        if (!loggerConfig.exclude || loggerConfig.exclude.indexOf(httpContext.get('request_url')) < 0) {
            logger.info(`(Request) => ${JSON.stringify(requestMeta.parameter)}`, requestMeta);
        }

        next();
    };
};

const errorLogger = () => {
    return (err, req, res, next) => {
        let errorMeta = {
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
