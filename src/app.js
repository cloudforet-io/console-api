import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import createError from 'http-errors';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

import indexRouter from '@/routes';
import config from '@/config/config';


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
//config.printImportedmodule(fs);

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

//app.listen(process.env.APP_PORT, () => { console.log(`Server is listening on port: ${process.env.APP_PORT}`)});
app.listen(3000, () => { console.log(`Server is listening on port: ${process.env.APP_PORT}`)});

// CONNECT TO MONGODB SERVER
config.expressConnect(mongoose);
// testCommon.runUnittest(express);
export default app;
