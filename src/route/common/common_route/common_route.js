import express from 'express';
import commonService from '../common_service/commonService';


const common_route = express.Router();

// create User
common_route.post('/random-data', commonService.randomDataGenerator);

export default common_route;
