import express from 'express';
import scheduleRouter from './schedule';
import scheduleRuleRouter from './schedule-rule';

const router = express.Router();

router.use('/schedule', scheduleRouter);
router.use('/schedule-rule', scheduleRuleRouter);

export default router;
