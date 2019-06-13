import express from 'express';

import userRoutes from './IdentityRoute/userRoutes';
import domainRoutes from './IdentityRoute/domainRoutes';
import projectRoutes from './IdentityRoute/projectRoutes';
import apiKeyRoutes from './IdentityRoute/apiKeyRoutes';

const Router = express.Router();

Router.use('/users', userRoutes);
Router.use('/domain', domainRoutes);
Router.use('/project', projectRoutes);
Router.use('/apikey', apiKeyRoutes);

export default Router;
