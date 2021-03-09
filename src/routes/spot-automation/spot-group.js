import express from 'express';
import asyncHandler from 'express-async-handler';
import * as spotGroup from '@controllers/spot-automation/spot-group';

const router = express.Router();

const controllers = [
    { url: '/create', func: spotGroup.createSpotGroup },
    { url: '/update', func: spotGroup.updateSpotGroup },
    { url: '/delete', func: spotGroup.deleteSpotGroup },
    { url: '/get', func: spotGroup.getSpotGroup },
    { url: '/list', func: spotGroup.listSpotGroups },
    { url: '/interrupt', func: spotGroup.interruptSpotGroups },
    { url: '/stat', func: spotGroup.statSpotGroups },
    { url: '/get-supported-resource-types', func: spotGroup.getSupportedResourceTypes }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
