import express from 'express';
import asyncHandler from 'express-async-handler';
import * as billing from '@controllers/billing/billing';

const router = express.Router();

const controllers = [
    { url: '/get-data', func: billing.getBillingData }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
