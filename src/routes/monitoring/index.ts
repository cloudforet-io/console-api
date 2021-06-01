import express from 'express';
import dataSourceRouter from './data-source';
import logRouter from './log';
import metricRouter from './metric';
import escalationPolicy from './escalation-policy';

const router = express.Router();

router.use('/data-source', dataSourceRouter);
router.use('/log', logRouter);
router.use('/metric', metricRouter);
router.use('/escalation-policy', escalationPolicy);
export default router;
