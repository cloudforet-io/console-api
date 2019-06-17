import express from 'express';

import authRoutes from './authRoutes/authRoutes';

const Router = express.Router();


Router.use('/', authRoutes);

export default Router;
