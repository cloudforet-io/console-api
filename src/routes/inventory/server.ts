import express from 'express';
import asyncHandler from 'express-async-handler';
import * as server from '@controllers/inventory/server';
import getData from '@controllers/inventory/server/get-data';
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
    { url: '/stat', func: server.statServers },
    { url: '/get-data', func: getData },
    { url: '/member/list', func: listServerMembers }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
