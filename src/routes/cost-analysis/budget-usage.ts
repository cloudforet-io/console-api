import express from 'express';
import asyncHandler from 'express-async-handler';
import * as budgetUsage from '@controllers/cost-analysis/budget-usage';
import { analyzeBudgetUsage } from '@controllers/cost-analysis/budget-usage/analyze-budget-usage';

const router = express.Router();

const controllers = [
    { url: '/list', func: budgetUsage.listBudgetUsage },
    { url: '/stat', func: budgetUsage.statBudgetUsage },
    { url: '/analyze', func: analyzeBudgetUsage }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
