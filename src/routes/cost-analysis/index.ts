import express from 'express';
import dataSourceRouter from './data-source';
import scheduleRouter from './schedule';
import exchangeRateRouter from './exchange-rate';
import costRouter from './cost';
import dataSourceRuleRouter from './data-source-rule';
import budgetRouter from './budget';
import dashboardRouter from './dashboard';
import costQuerySetRouter from './cost-query-set';

const router = express.Router();

router.use('/data-source', dataSourceRouter);
router.use('/schedule', scheduleRouter);
router.use('/exchange-rate', exchangeRateRouter);
router.use('/cost', costRouter);
router.use('/data-source-rule', dataSourceRuleRouter);
router.use('/budget', budgetRouter);
router.use('/dashboard', dashboardRouter);
router.use('/cost-query-set', costQuerySetRouter);
export default router;
