import express from 'express';

import alertRouter from './alert';
import dashboardRouter from './dashboard';
import dataSourceRouter from './data-source';
import escalationPolicy from './escalation-policy';
import eventRouter from './event';
import eventRuleRouter from './event-rule';
import logRouter from './log';
import maintenanceWindowRouter from './maintenance-window';
import metricRouter from './metric';
import noteRouter from './note';
import projectAlertConfig from './project-alert-config';
import webhookRouter from './webhook';

const router = express.Router();

router.use('/data-source', dataSourceRouter);
router.use('/log', logRouter);
router.use('/metric', metricRouter);
router.use('/webhook', webhookRouter);
router.use('/escalation-policy', escalationPolicy);
router.use('/project-alert-config', projectAlertConfig);
router.use('/alert', alertRouter);
router.use('/note', noteRouter);
router.use('/maintenance-window', maintenanceWindowRouter);
router.use('/event-rule', eventRuleRouter);
router.use('/event', eventRouter);
router.use('/dashboard', dashboardRouter);
export default router;
