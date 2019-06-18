import express from 'express';

import commonRoutes from './commonRoutes/commonRoute';

const Router = express.Router();

Router.use('/common', commonRoutes);


export default Router;
