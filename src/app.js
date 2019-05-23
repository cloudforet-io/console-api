import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import createError from 'http-errors';
import cors from 'cors';
import mongoose from 'mongoose';
import indexRouter from '@/routes';
import config from '@/config/config';
import dotenv from 'dotenv';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/', indexRouter);
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

config.setCurrrentEnv(dotenv);

// Cross-origin setup
const whitelist = [];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// CONNECT TO MONGODB SERVER
config.expressConnect(mongoose);

export default app;
