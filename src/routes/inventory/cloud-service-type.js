import express from 'express';
import asyncHandler from 'express-async-handler';
import * as cloudServiceType from '@controllers/inventory/cloud-service-type';
import { parameterBuilder, setTagRouter } from '@lib/tag/tag-route';

const router = express.Router();

setTagRouter(parameterBuilder(cloudServiceType.listCloudServiceTypes,cloudServiceType.updateCloudServiceType,'cloud_service_type_id',router));

const controllers = [
    { url: '/create', func: cloudServiceType.createCloudServiceType },
    { url: '/update', func: cloudServiceType.updateCloudServiceType },
    { url: '/delete', func: cloudServiceType.deleteCloudServiceType },
    { url: '/get', func: cloudServiceType.getCloudServiceType },
    { url: '/list', func: cloudServiceType.listCloudServiceTypes },
    { url: '/stat', func: cloudServiceType.statCloudServiceTypes }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
