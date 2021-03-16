import express from 'express';
import asyncHandler from 'express-async-handler';
import { exportExcel } from '@controllers/add-ons/excel';
import { download } from '@lib/excel';

const router = express.Router();
const controllers = [
    { url: '/export', func: exportExcel },
    { url: '/download', func: download }
];

controllers.forEach((config) => {
    const method = config.url === '/download' ? 'get' : 'post';
    router[method](config.url, asyncHandler(async (req, res) => {
        if(method === 'get') res.end(await config.func({req, res}));
        else res.json(await config.func(req));
    }));
});

export default router;
