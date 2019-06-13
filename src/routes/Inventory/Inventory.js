import express from 'express';

import serverRoutes from './InventoryRoutes/serverRoutes';
import settingRoutes from './InventoryRoutes/settingRoutes';
import networkRoutes from './InventoryRoutes/networkRoutes';
import dataCenterRoutes from './InventoryRoutes/dataCenterRoutes';

const Router = express.Router();

Router.use('/server', serverRoutes);
Router.use('/setting', settingRoutes);
Router.use('/network', networkRoutes);
Router.use('/datacenter', dataCenterRoutes);

export default Router;
