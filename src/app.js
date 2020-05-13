import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import expressHealthCheck from 'express-healthcheck';
import httpContext from 'express-http-context';
import { authentication, corsOptions } from '@lib/authentication';
import { requestLogger, errorLogger} from '@lib/logger';
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
app.use((req, res, next) => {
    next(createError(404));
});

//Set EJS templates
setHtmlEjs(app);

app.use(errorLogger());
app.use((err, req, res, next) => {
  // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
    res.status(err.status || 500);
    let errorResponse = {
        error: {
            message: err.details || err.message,
            code: err.error_code || 'ERROR_UNKNOWN'
        }
    };

    if (err.fail_items) {
        errorResponse.error.fail_items = err.fail_items;
    }

    res.json(errorResponse);
});

module.exports = app;
