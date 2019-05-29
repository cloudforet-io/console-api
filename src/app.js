/* =======================
    LOAD THE DEPENDENCIES
==========================*/

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import createError from 'http-errors';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jsonwebtoken from 'jsonwebtoken';
import fs from 'fs';

/* =======================
    LOAD THE CONFIG
==========================*/
import indexRouter from '@/routes';
import config from '@/config/config';

const app = express();

app.use(logger('dev'));

app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use('/api/', indexRouter);
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

app.set('jwt-secret', config.secretKey);

config.setCurrrentEnv(dotenv);


/* =======================
CHECK OUT ALL DEPENDENCIES IF NEEDED
==========================*/
//config.printImportedmodule(fs);


// Cross-origin setup
const whitelist = [];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS by DK'));
    }
  },
};


app.use(cors(corsOptions));

// error 
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//app.listen(process.env.APP_PORT, () => { console.log(`Server is listening on port: ${process.env.APP_PORT}`)});

if(process.env.NODE_ENV === 'temp' || process.env.NODE_ENV === 'local') app.listen(3000, () => { console.log(`Server is listening on port: ${process.env.APP_PORT}`)});

// CONNECT TO MONGODB SERVER
config.expressConnect(mongoose);
// testCommon.runUnittest(express);
export default app;
