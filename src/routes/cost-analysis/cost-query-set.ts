import express from 'express';
import asyncHandler from 'express-async-handler';
import * as costQuerySet from '@controllers/cost-analysis/cost-query-set';

const router = express.Router();

const controllers = [
    { url: '/create', func: costQuerySet.createCostQuerySet },
    { url: '/update', func: costQuerySet.updateCostQuerySet },
    { url: '/change-scope', func: costQuerySet.changeCostQuerySetScope },
    { url: '/delete', func: costQuerySet.deleteCostQuerySet },
    { url: '/get', func: costQuerySet.getCostQuerySet },
    { url: '/list', func: costQuerySet.listCostQuerySets },
    { url: '/stat', func: costQuerySet.statCostQuerySets }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
