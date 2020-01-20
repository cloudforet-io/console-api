import express from 'express';
import asyncHandler from 'express-async-handler';
import * as cloudService from '@controllers/inventory/cloud-service';

const router = express.Router();
const controllers = [
    { url: '/create', func: cloudService.createCloudService },
    { url: '/update', func: cloudService.updateCloudService },
    { url: '/delete', func: cloudService.deleteCloudServices },
    { url: '/get', func: cloudService.getCloudService },
    { url: '/list', func: cloudService.listCloudServices }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
