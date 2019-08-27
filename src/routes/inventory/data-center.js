import express from 'express';
import asyncHandler from 'express-async-handler';
//import * as dataCenter from '@controllers/inventory/data-center';
import treeDataCenter from '@controllers/inventory/data-center/tree-data-center';

const router = express.Router();
const controllers = [
    { url: '/tree', func: treeDataCenter }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
