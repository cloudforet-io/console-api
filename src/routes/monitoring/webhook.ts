import express from 'express';
import asyncHandler from 'express-async-handler';
import * as webhook from '@controllers/monitoring/webhook';

const router = express.Router();

const controllers = [
    { url: '/create', func: webhook.createWebhook },
    { url: '/update', func: webhook.updateWebhook },
    { url: '/update-plugin', func: webhook.updateWebhookPlugin },
    { url: '/enable', func: webhook.enableWebhook },
    { url: '/disable', func: webhook.disableWebhook },
    { url: '/delete', func: webhook.deleteWebhook },
    { url: '/get', func: webhook.getWebhook },
    { url: '/list', func: webhook.listWebhooks },
    { url: '/stat', func: webhook.statWebhooks }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
