import express from 'express';

import controllerRouter from './controller';
import domainRouter from './domain';
import jobRouter from './job';
import jobTaskRouter from './job-task';
import scheduleRouter from './schedule';
import scheduleRuleRouter from './schedule-rule';

const router = express.Router();

router.use('/domain', domainRouter);
router.use('/schedule', scheduleRouter);
router.use('/schedule-rule', scheduleRuleRouter);
router.use('/controller', controllerRouter);
router.use('/job', jobRouter);
router.use('/job-task', jobTaskRouter);

export default router;
