import express from 'express';
import asyncHandler from 'express-async-handler';
import getSummary from '@controllers/statistics/summary';
import getCollectionState from '@controllers/statistics/collection-state';
import getServerState from '@controllers/statistics/server-state';
import getServerType from '@controllers/statistics/server-type';
import getRegionItems from '@controllers/statistics/region-items';

const router = express.Router();
const controllers = [
    { url: '/summary', func: getSummary },
    { url: '/collection-state', func: getCollectionState },
    { url: '/server-state', func: getServerState },
    { url: '/server-type', func: getServerType },
    { url: '/region-items', func: getRegionItems }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
