/* =======================
    LOAD THE DEPENDENCIES
========================== */

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import createError from 'http-errors';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';

/* =======================
    LOAD THE CONFIG
========================== */
import indexRouter from '@/routes';
import config from '@/config/config';
import fs from 'fs';


const app = express();

config.setCurrrentEnv(dotenv);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'temp') app.use(cors());
else app.use(cors(config.corrOptionPreperation(process.env.CORS_URLS, true)));

/* =======================
CHECK OUT ALL DEPENDENCIES IF NEEDED
========================== */
// config.printImportedmodule(fs);
// app.use('/api-docs', config.swagger('serve'), config.swagger('setup'));

/* =======================
Session Setup within Redis
========================== */
app.use(session(config.setRedisSession()));
app.use('/api/', indexRouter);


/* =======================
 SIMPLE Error Handler
========================== */

app.use((req, res, next) => {
  next(createError(404));
  res.json({ msg: 'NO AVAILABLE' });
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'temp' ? err : {};
  // render the error page
  res.status(err.status || 500);
  // TODO this must be updated in cases of wrong action through allowed cons
  res.send('<h1>Sorry, Something went wrong. Please, confirm your action. </h1>');
  // res.render();
});


/* =======================
 SET UP APP'S LISTENER PORT
========================== */
config.connectListener(app);

/* =======================
  CONNECT TO MONGODB SERVER
========================== */
config.expressConnect(mongoose);
// testCommon.runUnittest(express);

export default app;
