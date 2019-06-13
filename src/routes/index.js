import express from 'express';

import Auth from './Auth/Auth';
import Identity from './Identity/Identity';
import Inventory from './Inventory/Inventory';
import Plugin from './Plugin/Plugin';
import commonService from '@/service/Common/commonService';


const Router = express.Router();

Router.get('/check', commonService.healthCheck);

Router.use('/auth', Auth);
Router.use('/identity', Identity);
Router.use('/inventory', Inventory);
Router.use('/plugin', Plugin);

export default Router;
