import express from 'express';
import dataCenterRouter from './data-center';
import regionRouter from './region';
import zoneRouter from './zone';
import poolRouter from './pool';
import serverRouter from './server';
import collectorRouter from './collector';


const router = express.Router();
router.use('/data-center', dataCenterRouter);
router.use('/region', regionRouter);
router.use('/zone', zoneRouter);
router.use('/pool', poolRouter);
router.use('/server', serverRouter);
router.use('/collector', collectorRouter);

export default router;
