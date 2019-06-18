import express from 'express';

import Auth      from './Auth/Auth';
import Identity  from './Identity/Identity';
import Inventory from './Inventory/Inventory';
import Plugin    from './Plugin/Plugin';
import Common    from './Common/Common';

/*
* This is health check funtion in Spinaker
* Please, do not remove it.
*/
import commonService from './Common/commonService/commonService';


const Router = express.Router();

Router.get('/check', commonService.healthCheck);

Router.use('/Auth', Auth);
Router.use('/Identity', Identity);
Router.use('/Inventory', Inventory);
Router.use('/Plugin', Plugin);
Router.use('/Common', Common);

export default Router;
