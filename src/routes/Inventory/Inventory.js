import express from 'express';

import serverRoute from './InventoryRoutes/serverRoute';
import settingRoute from './InventoryRoutes/settingRoute';
import networkRoute from './InventoryRoutes/networkRoute';
import dataCenterRoute from './InventoryRoutes/dataCenterRoute';

const Router = express.Router();

Router.use('/server', serverRoute);
Router.use('/setting', settingRoute);
Router.use('/network', networkRoute);
Router.use('/dataCenter', dataCenterRoute);

export default Router;
