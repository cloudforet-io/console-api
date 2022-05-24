import express from 'express';
import asyncHandler from 'express-async-handler';

import * as protocol from '@controllers/notification/protocol';

const router = express.Router();

const controllers = [
    { url: '/create', func: protocol.createProtocol },
    { url: '/update', func: protocol.updateProtocol },
    { url: '/update-plugin', func: protocol.updateProtocolPlugin },
    { url: '/enable', func: protocol.enableProtocol },
    { url: '/disable', func: protocol.disableProtocol },
    { url: '/delete', func: protocol.deleteProtocol },
    { url: '/get', func: protocol.getProtocol },
    { url: '/list', func: protocol.listProtocol },
    { url: '/stat', func: protocol.statProtocol }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
