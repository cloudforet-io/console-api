import express from 'express';
import domainRouter from './domain';
import scheduleRouter from './schedule';
import scheduleRuleRouter from './schedule-rule';
import controllerRouter from './controller';
import jobRouter from './job';
import jobTaskRouter from './job-task';

const router = express.Router();

router.use('/domain', domainRouter);
router.use('/schedule', scheduleRouter);
router.use('/schedule-rule', scheduleRuleRouter);
router.use('/controller', controllerRouter);
router.use('/job', jobRouter);
router.use('/job-task', jobTaskRouter);

export default router;
