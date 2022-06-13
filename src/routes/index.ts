import express from 'express';

import addOnsRouter from './add-ons';
import configRouter from './config';
import costAnalysisRouter from './cost-analysis';
import identityRouter from './identity';
import inventoryRouter from './inventory';
import monitoringRouter from './monitoring';
import notificationRouter from './notification';
import pluginRouter from './plugin';
import powerSchedulerRouter from './power-scheduler';
import repositoryRouter from './repository';
import secretRouter from './secret';
import statisticsRouter from './statistics';

const router = express.Router();
router.use('/statistics', statisticsRouter);
router.use('/identity', identityRouter);
router.use('/repository', repositoryRouter);
router.use('/secret', secretRouter);
router.use('/inventory', inventoryRouter);
router.use('/plugin', pluginRouter);
router.use('/monitoring', monitoringRouter);
router.use('/config', configRouter);
router.use('/power-scheduler', powerSchedulerRouter);
router.use('/notification', notificationRouter);
router.use('/cost-analysis', costAnalysisRouter);
router.use('/add-ons', addOnsRouter);
export default router;
