import express from 'express';
import asyncHandler from 'express-async-handler';
import * as server from '@controllers/inventory/server';
import getData from '@controllers/inventory/server/get-data';
import listServerMembers from '@controllers/inventory/server/list-server-members';
import Tag from '@lib/tag';
import tagRouter from '../tag/';

const router = express.Router();

const bulkTagActionParam = {
    list: server.listServers,
    update: server.updateServer,
    key: 'server_id'
};

router.use('/tag', Tag.bulkMiddleHandler(bulkTagActionParam), tagRouter);
const controllers = [
    { url: '/create', func: server.createServer },
    { url: '/update', func: server.updateServer },
    { url: '/change-state', func: server.changeServerState },
    { url: '/change-project', func: server.changeServerProject },
    { url: '/change-pool', func: server.changeServerPool },
    { url: '/delete', func: server.deleteServers },
    { url: '/get', func: server.getServer },
    { url: '/list', func: server.listServers },
    { url: '/get-data', func: getData },
    { url: '/member/list', func: listServerMembers }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
