import express from 'express';
import asyncHandler from 'express-async-handler';
import * as file from '@controllers/add-ons/file';
const router = express.Router();

const controllers = [
    { url: '/download', func: file.download },
    { url: '/upload', func: file.upload }
];

controllers.map((config) => {
    const routeMethod = config.url === '/download' ? 'get' : 'post';
    router[routeMethod](config.url, asyncHandler(async (req, res, next) => {
        if(routeMethod === 'get') res.end(await config.func({req, res}));
        else res.json(await config.func(req));
    }));
});

export default router;

