import express from 'express';
import dataCenterRouter from './data-center';
import regionRouter from './region';
import zoneRouter from './zone';
import poolRouter from './pool';


const router = express.Router();
router.use('/data-center', dataCenterRouter);
router.use('/region', regionRouter);
router.use('/zone', zoneRouter);
router.use('/pool', poolRouter);

export default router;
