/* =======================
    LOAD THE DEPENDENCIES
========================== */

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import createError from 'http-errors';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import {v5 as uuidv5} from 'uuid';
import redis from 'redis';
import connectRedis from 'connect-redis';

/* =======================
    LOAD THE CONFIG
========================== */
import indexRouter from '@/routes';
import config from '@/config/config';
import fs from 'fs';

const app = express();

app.use(logger('dev'));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.set('jwt-secret', config.secretKey);
config.setCurrrentEnv(dotenv);


/* =======================
CHECK OUT ALL DEPENDENCIES IF NEEDED
========================== */
// config.printImportedmodule(fs);

const RedisStore = connectRedis(session);
const sess = {
  resave: false,
  saveUninitialized: false,
  secret: config.secretKey,
  name: 'auth',
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({ host: 'localhost',
    port: 6379,
    client: config.redisClient,
    prefix: 'session:',
    logErrors: true }),
}


app.use(session(sess));
app.use('/api/', indexRouter);

app.use((req, res, next) => {
  next(createError(404));
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
