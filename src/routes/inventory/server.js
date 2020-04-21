import express from 'express';
import asyncHandler from 'express-async-handler';
import * as server from '@controllers/inventory/server';
import getData from '@controllers/inventory/server/get-data';
import listServerMembers from '@controllers/inventory/server/list-server-members';
import { parameterBuilder, setTagRouter } from '@lib/tag/tag-route';

const router = express.Router();

setTagRouter(parameterBuilder(server.listServers,server.updateServer,'server_id',router));
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

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
