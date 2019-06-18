import express from 'express';

import pluginRoute from './PluginRoutes/pluginRoute';
import pluginManagerRoute from './PluginRoutes/pluginManagerRoute';

const Router = express.Router();

Router.use('/plugin', pluginRoute);
Router.use('/pluginManager', pluginManagerRoute);

export default Router;
