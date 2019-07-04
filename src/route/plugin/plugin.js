import express from 'express';

import plugin_route from './plugin_route/plugin_route';
import plugin_manager_route from './plugin_route/plugin_manager_route';

const Router = express.Router();

Router.use('/plugin', plugin_route);
Router.use('/pluginManager', plugin_manager_route);

export default Router;
