import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import Debug from 'debug';
import indexRouter from './routes';

const debug = Debug('cloudone:server');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
    debug(err);
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.details || err.message,
            code: err.error_code || 'ERROR_UNKNOWN'
        }
    });
});

module.exports = app;
