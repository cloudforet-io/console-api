import express from 'express';
import dataSourceRouter from './data-source';
import logRouter from './log';
import metricRouter from './metric';
import escalationPolicy from './escalation-policy';
import projectAlertConfig from './project-alert-config';

const router = express.Router();

router.use('/data-source', dataSourceRouter);
router.use('/log', logRouter);
router.use('/metric', metricRouter);
router.use('/escalation-policy', escalationPolicy);
router.use('/project-alert-config', projectAlertConfig);
export default router;
