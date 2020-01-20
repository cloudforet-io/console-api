import express from 'express';
import dataCenterRouter from './data-center';
import regionRouter from './region';
import zoneRouter from './zone';
import poolRouter from './pool';
import networkRouter from './network';
import serverRouter from './server';
import cloudServiceRouter from './cloud-service';
import cloudServiceTypeRouter from './cloud-service-type';
import collectorRouter from './collector';
import jobRouter from './job';


const router = express.Router();
router.use('/data-center', dataCenterRouter);
router.use('/region', regionRouter);
router.use('/zone', zoneRouter);
router.use('/pool', poolRouter);
router.use('/network', networkRouter);
router.use('/server', serverRouter);
router.use('/cloud-service', cloudServiceRouter);
router.use('/cloud-service-type', cloudServiceTypeRouter);
router.use('/collector', collectorRouter);
router.use('/job', jobRouter);

export default router;
