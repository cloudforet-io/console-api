import express from 'express';
import asyncHandler from 'express-async-handler';
import * as excel from '@controllers/add-ons/excel';

const router = express.Router();
const controllers = [
    { url: '/export', func: excel.exportExcel },
    { url: '/download', func: excel.downloadExcel }
];

controllers.forEach((config) => {
    const method = config.url === '/download' ? 'get' : 'post';
    router[method](config.url, asyncHandler(async (req, res) => {
        if(method === 'get') res.end(await config.func(req, res));
        else res.json(await config.func(req));
    }));
});

export default router;
