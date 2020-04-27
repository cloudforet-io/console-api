import express from 'express';
import configMapRouter from './config-map';

const router = express.Router();

router.use('/config-map', configMapRouter);

export default router;
