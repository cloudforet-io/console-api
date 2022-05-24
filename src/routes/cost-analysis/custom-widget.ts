import express from 'express';
import asyncHandler from 'express-async-handler';

import * as customWidget from '@controllers/cost-analysis/custom-widget';

const router = express.Router();

const controllers = [
    { url: '/create', func: customWidget.createCustomWidget },
    { url: '/update', func: customWidget.updateCustomWidget },
    { url: '/delete', func: customWidget.deleteCustomWidget },
    { url: '/get', func: customWidget.getCustomWidget },
    { url: '/list', func: customWidget.listCustomWidgets },
    { url: '/stat', func: customWidget.statCustomWidgets }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
