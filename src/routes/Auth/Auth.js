import express from 'express';
import authRoute from './authRoutes/authRoute';

const Router = express.Router();

Router.use('/', authRoute);

export default Router;
