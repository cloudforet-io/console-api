import express from 'express';
import asyncHandler from 'express-async-handler';

import * as dataSourceRule from '@controllers/cost-analysis/data-source-rule';

const router = express.Router();

const controllers = [
    { url: '/create', func: dataSourceRule.createDataSourceRule },
    { url: '/update', func: dataSourceRule.updateDataSourceRule },
    { url: '/change-order', func: dataSourceRule.changeDataSourceRuleOrder },
    { url: '/delete', func: dataSourceRule.deleteDataSourceRule },
    { url: '/get', func: dataSourceRule.getDataSourceRule },
    { url: '/list', func: dataSourceRule.listDataSourceRules },
    { url: '/stat', func: dataSourceRule.statDataSourceRules }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
