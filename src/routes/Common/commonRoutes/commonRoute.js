import express from 'express';
import commonService from '../commonService/commonService';


const commonRouter = express.Router();

// create User
commonRouter.post('/randomData', commonService.randomDataGenerator);

export default commonRouter;
