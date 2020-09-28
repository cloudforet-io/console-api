import express from 'express';
import regionRouter from './region';
import serverRouter from './server';
import cloudServiceRouter from './cloud-service';
import cloudServiceTypeRouter from './cloud-service-type';
import resourceGroupRouter from './resource-group';
import collectorRouter from './collector';
import jobRouter from './job';
import jobTaskRouter from './job-task';

const router = express.Router();

router.use('/region', regionRouter);
router.use('/server', serverRouter);
router.use('/cloud-service', cloudServiceRouter);
router.use('/cloud-service-type', cloudServiceTypeRouter);
router.use('/resource-group', resourceGroupRouter);
router.use('/collector', collectorRouter);
router.use('/job', jobRouter);
router.use('/job-task', jobTaskRouter);

export default router;
