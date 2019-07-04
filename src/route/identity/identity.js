import express from 'express';

import user_route from './identity_route/user_route';
import domain_route from './identity_route/domain_route';
import project_route from './identity_route/project_route';
import api_key_route from './identity_route/api_key_route';

const Router = express.Router();

Router.use('/user', user_route);
Router.use('/domain', domain_route);
Router.use('/project', project_route);
Router.use('/api-key', api_key_route);

export default Router;
