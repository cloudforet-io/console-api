import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import expressHealthCheck from 'express-healthcheck';
import httpContext from 'express-http-context';
import { authentication, corsOptions } from '@lib/authentication';
import { requestLogger, errorLogger} from '@lib/logger';
import { notFoundErrorHandler, defaultErrorHandler} from '@lib/error';
import { setHtmlEjs } from '@lib/html';
import indexRouter from 'routes';
const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(httpContext.middleware);
app.use(authentication());
app.use(requestLogger());

app.use('/check', expressHealthCheck());
app.use('/', indexRouter);
app.use(notFoundErrorHandler());

//Set EJS templates
setHtmlEjs(app);

app.use(errorLogger());
app.use(defaultErrorHandler());

module.exports = app;
