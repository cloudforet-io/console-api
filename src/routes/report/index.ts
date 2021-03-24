import express from 'express';
import domainRouter from './domain';
import reportRouter from './report';
import scheduleRouter from './schedule';
import templateRouter from './template';

const router = express.Router();

router.use('/domain', domainRouter);
router.use('/report', reportRouter);
router.use('/schedule', scheduleRouter);
router.use('/template', templateRouter);
export default router;
