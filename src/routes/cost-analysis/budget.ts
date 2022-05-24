import express from 'express';
import asyncHandler from 'express-async-handler';

import * as budget from '@controllers/cost-analysis/budget';

const router = express.Router();

const controllers = [
    { url: '/create', func: budget.createBudget },
    { url: '/create/template', func: budget.createTemplate },
    { url: '/update', func: budget.updateBudget },
    { url: '/set-notification', func: budget.setBudgetNotification },
    { url: '/delete', func: budget.deleteBudget },
    { url: '/get', func: budget.getBudget },
    { url: '/list', func: budget.listBudgets },
    { url: '/stat', func: budget.statBudgets }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        if(config.url === '/create/template') res.end(await config.func(req.body, res));
        else res.json(await config.func(req.body, res));
    }));
});

export default router;
