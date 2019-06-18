import express from 'express';

import userRoute from './IdentityRoutes/userRoute';
import domainRoute from './IdentityRoutes/domainRoute';
import projectRoute from './IdentityRoutes/projectRoute';
import apiKeyRoute from './IdentityRoutes/apiKeyRoute';

const Router = express.Router();

Router.use('/users', userRoute);
Router.use('/domain', domainRoute);
Router.use('/project', projectRoute);
Router.use('/apiKey', apiKeyRoute);

export default Router;
