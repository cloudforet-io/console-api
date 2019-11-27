import express from 'express';
import asyncHandler from 'express-async-handler';
import * as summary from '@controllers/statistics/summary';
import getCollectionState from '@controllers/statistics/collection-state';
import getServerState from '@controllers/statistics/server-state';
import getServerType from '@controllers/statistics/server-type';
import getDataCenterItems from '@controllers/statistics/datacenter-items';

const router = express.Router();
const controllers = [
    { url: '/summary', func: summary.getSummary },
    { url: '/project-summary', func: summary.getProjectSummary },
    { url: '/collection-state', func: getCollectionState },
    { url: '/server-state', func: getServerState },
    { url: '/server-type', func: getServerType },
    { url: '/datacenter-items', func: getDataCenterItems }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
