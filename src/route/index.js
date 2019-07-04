import express from 'express';

import Auth      from './auth/auth';
import Identity  from './identity/identity';
import Inventory from './inventory/inventory';
import Plugin    from './plugin/plugin';
import Common    from './common/common';

/*
* This is health check funtion in Spinaker
* Please, do not remove it.
*/
import commonService from './common/common_service/commonService';


const Router = express.Router();

Router.get('/check', commonService.healthCheck);

Router.use('/auth', Auth);
Router.use('/identity', Identity);
Router.use('/inventory', Inventory);
Router.use('/plugin', Plugin);
Router.use('/common', Common);

export default Router;
