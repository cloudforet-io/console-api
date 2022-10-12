import express from 'express';
import asyncHandler from 'express-async-handler';

import * as cloudServiceTag from '@controllers/inventory/cloud-service-tag';

const router = express.Router();

const controllers = [
    { url: '/list', func: cloudServiceTag.listCloudServiceTags },
    { url: '/stat', func: cloudServiceTag.statCloudServiceTags }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
