import express from 'express';
import asyncHandler from 'express-async-handler';

import * as cloudServiceType from '@controllers/inventory/cloud-service-type';
import { analyzeCloudServiceTypes } from '@controllers/inventory/cloud-service-type/analyze-cloud-service-types';

const router = express.Router();

const controllers = [
    { url: '/create', func: cloudServiceType.createCloudServiceType },
    { url: '/update', func: cloudServiceType.updateCloudServiceType },
    { url: '/delete', func: cloudServiceType.deleteCloudServiceType },
    { url: '/get', func: cloudServiceType.getCloudServiceType },
    { url: '/list', func: cloudServiceType.listCloudServiceTypes },
    { url: '/stat', func: cloudServiceType.statCloudServiceTypes },
    { url: '/analyze', func: analyzeCloudServiceTypes }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
