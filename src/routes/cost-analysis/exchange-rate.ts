import express from 'express';
import asyncHandler from 'express-async-handler';
import * as exchangeRate from '@controllers/cost-analysis/exchange-rate';

const router = express.Router();

const controllers = [
    { url: '/create', func: exchangeRate.setExchangeRate },
    { url: '/update', func: exchangeRate.resetExchangeRate },
    { url: '/get', func: exchangeRate.getExchangeRate },
    { url: '/list', func: exchangeRate.listExchangeRates }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
