import config from 'config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import expressHealthCheck from 'express-healthcheck';
import httpContext from 'express-http-context';

import { apiReflection } from '@lib/api';
import { authentication, corsOptions } from '@lib/authentication';
import { notFoundErrorHandler, defaultErrorHandler } from '@lib/error';
import { requestLogger, errorLogger } from '@lib/logger';
import indexRouter from '@routes';
const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: config.get('requestBodySize') || '10mb' }) as any);
app.use(express.urlencoded({ limit: config.get('requestBodySize') || '10mb', extended: false }) as any);
app.use(cookieParser());

app.use(httpContext.middleware);
app.use(authentication());
app.use(requestLogger());

app.use('/check', expressHealthCheck());
app.use('/', indexRouter);
app.use('/api/reflection', apiReflection(indexRouter));

app.use(notFoundErrorHandler());
app.use(errorLogger());
app.use(defaultErrorHandler());

module.exports = { app };

export {
    app
};
