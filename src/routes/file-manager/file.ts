import express from 'express';
import asyncHandler from 'express-async-handler';

import * as file from '@controllers/file-manager/file';

const router = express.Router();

const controllers = [
    { url: '/add', func: file.addFile },
    { url: '/update', func: file.updateFile },
    { url: '/delete', func: file.deleteFile },
    { url: '/get-download-url', func: file.getDownloadUrl },
    { url: '/get', func: file.getFile },
    { url: '/list', func: file.listFiles },
    { url: '/stat', func: file.statFiles }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
