import express from 'express';
import asyncHandler from 'express-async-handler';
import * as resourceGroup from '@controllers/inventory/resource-group';

const router = express.Router();

const controllers = [
    { url: '/create', func: resourceGroup.createResourceGroup },
    { url: '/update', func: resourceGroup.updateResourceGroup },
    { url: '/delete', func: resourceGroup.deleteResourceGroup },
    { url: '/get', func: resourceGroup.getResourceGroup },
    { url: '/list', func: resourceGroup.listResourceGroups },
    { url: '/stat', func: resourceGroup.statResourceGroups }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
