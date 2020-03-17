import express from 'express';
import asyncHandler from 'express-async-handler';
import * as file from '@controllers/add-ons/file';
const router = express.Router();

const controllers = [
    { url: '/download', func: file.download },
    { url: '/upload', func: file.upload }
];

controllers.map((config) => {
    if(config.url === '/download'){
        router.get(config.url, asyncHandler(async (req, res, next) => {
            const buffer = await config.func({req, res});
            res.end(buffer);
        }));
    } else {
        router.post(config.url, asyncHandler(async (req, res, next) => {
            res.json(await config.func(req));
        }));
    }
});

export default router;

