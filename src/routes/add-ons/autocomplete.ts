import express from 'express';
import asyncHandler from 'express-async-handler';

import { getDistinctValues } from '@controllers/add-ons/autocomplete/distinct';
import { getResources } from '@controllers/add-ons/autocomplete/resource';

const router = express.Router();

const controllers = [
    { url: '/resource', func: getResources },
    { url: '/distinct', func: getDistinctValues }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
