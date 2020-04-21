import express from 'express';
import asyncHandler from 'express-async-handler';
import * as dataSource from '@controllers/monitoring/data-source';
const router = express.Router();

const controllers = [
    { url: '/register', func: dataSource.registerDataSource },
    { url: '/update', func: dataSource.updateDataSource },
    { url: '/enable', func: dataSource.enableDataSource },
    { url: '/disable', func: dataSource.disableDataSource },
    { url: '/deregister', func: dataSource.deregisterDataSource },
    { url: '/plugin/verify', func: dataSource.verifyPluginDataSource },
    { url: '/get', func: dataSource.getDataSource },
    { url: '/list', func: dataSource.listDataSources },
    { url: '/stat', func: dataSource.statDataSources }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
