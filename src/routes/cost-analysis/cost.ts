import express from 'express';
import asyncHandler from 'express-async-handler';

import * as cost from '@controllers/cost-analysis/cost';
// import { analyzeCosts } from '@controllers/cost-analysis/cost/analyze-costs';

const router = express.Router();

const controllers = [
    { url: '/create', func: cost.createCost },
    { url: '/delete', func: cost.deleteCost },
    { url: '/get', func: cost.getCost },
    { url: '/list', func: cost.listCosts },
    { url: '/stat', func: cost.statCosts },
    { url: '/analyze', func: cost.analyzeCosts }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
