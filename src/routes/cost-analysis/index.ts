import express from 'express';

import budgetRouter from './budget';
import budgetUsageRouter from './budget-usage';
import costRouter from './cost';
import costQuerySetRouter from './cost-query-set';
import customWidgetRouter from './custom-widget';
import dataSourceRouter from './data-source';
import dataSourceRuleRouter from './data-source-rule';
import exchangeRateRouter from './exchange-rate';
import publicDashboardRouter from './public-dashboard';
import scheduleRouter from './schedule';
import userDashboardRouter from './user-dashboard';

const router = express.Router();

router.use('/data-source', dataSourceRouter);
router.use('/schedule', scheduleRouter);
router.use('/exchange-rate', exchangeRateRouter);
router.use('/cost', costRouter);
router.use('/data-source-rule', dataSourceRuleRouter);
router.use('/budget', budgetRouter);
router.use('/budget-usage', budgetUsageRouter);
router.use('/public-dashboard', publicDashboardRouter);
router.use('/user-dashboard', userDashboardRouter);
router.use('/cost-query-set', costQuerySetRouter);
router.use('/custom-widget', customWidgetRouter);
export default router;
