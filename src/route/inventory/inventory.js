import express from 'express';

import server_route from './inventory_routes/server_route';
import setting_route from './inventory_routes/setting_route';
import network_route from './inventory_routes/network_route';
import data_center_route from './inventory_routes/data_center_route';

const Router = express.Router();

Router.use('/server', server_route);
Router.use('/setting', setting_route);
Router.use('/network', network_route);
Router.use('/dataCenter', data_center_route);

export default Router;
