import express from 'express';
import authRoute from './auth_route/auth_route';

const Router = express.Router();

Router.use('/', authRoute);

export default Router;
