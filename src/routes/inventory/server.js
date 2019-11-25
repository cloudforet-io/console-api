import express from 'express';
import asyncHandler from 'express-async-handler';
import * as server from '@controllers/inventory/server';
import getServerData from '@controllers/inventory/server/get-server-data';
import listServerMembers from '@controllers/inventory/server/list-server-members';

const router = express.Router();
const controllers = [
    { url: '/create', func: server.createServer },
    { url: '/update', func: server.updateServer },
    { url: '/change-state', func: server.changeServerState },
    { url: '/change-project', func: server.changeServerProject },
    { url: '/change-pool', func: server.changeServerPool },
    { url: '/delete', func: server.deleteServers },
    { url: '/get', func: server.getServer },
    { url: '/list', func: server.listServers },
    { url: '/member/list', func: listServerMembers },
    { url: '/get-data', func: getServerData }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
