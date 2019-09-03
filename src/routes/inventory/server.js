import express from 'express';
import asyncHandler from 'express-async-handler';
import * as server from '@controllers/inventory/server';
import listServerAdmins from '@controllers/inventory/server/list-server-admins';

const router = express.Router();
const controllers = [
    { url: '/create', func: server.createServer },
    { url: '/update', func: server.updateServer },
    { url: '/change-state', func: server.changeServerState },
    { url: '/change-project', func: server.changeServerProject },
    { url: '/change-pool', func: server.changeServerPool },
    { url: '/delete', func: server.deleteServers },
    { url: '/get-data', func: server.getServerData },
    { url: '/get', func: server.getServer },
    { url: '/list', func: server.listServers },
    { url: '/admin/list', func: listServerAdmins }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
