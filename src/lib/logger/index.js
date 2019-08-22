import winston from 'winston';

const defaultFilter = winston.format((info, opts) => {
    console.log(info);
});

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        defaultFilter(),
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint()
    ),
    defaultMeta: {
        service: 'wconsole-server'
    },
    transports: [
        new winston.transports.Console()
    ]
});

const requestLogger = () => {
    return (req, res, next) => {
        // add transaction_id
        // http url / method
        // user_info
        // client ip
        // file & line
        // host??
        // error code / message / status
        // date

        let requestMeta = {
            parameter: {}
        };

        if (req.method == 'GET') {
            requestMeta.parameter = req.query;
        } else if (req.method == 'POST') {
            requestMeta.parameter = req.body;
        }

        logger.info('request api', requestMeta);
        logger.info('test');

        next();
    };
};

const errorLogger = () => {
    return (req, res, next) => {
        next();
    };
};


export default logger;
export {
    logger,
    requestLogger,
    errorLogger
};
