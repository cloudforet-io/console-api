import express from 'express';
import asyncHandler from 'express-async-handler';
import * as server from '@controllers/inventory/server';
import getData from '@controllers/inventory/server/get-data';
import listServerMembers from '@controllers/inventory/server/list-server-members';
import Tag from '@lib/tag';

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
    { url: '/get-data', func: getData },
    { url: '/member/list', func: listServerMembers },
    { url: '/tag/set', func: Tag.bulkTagsAction, param: { list:server.listServers, update: server.updateServer, flag: { action: 'set', key: 'server'}} },
    { url: '/tag/update', func: Tag.bulkTagsAction, param: { list:server.listServers, update: server.updateServer, flag:{ action: 'update', key: 'server'}} },
    { url: '/tag/delete', func: Tag.bulkTagsAction, param: { list:server.listServers, update: server.updateServer, flag: { action: 'delete',key: 'server'}} }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(config.param ? {
            ...config.param,
            body: req.body
        }: req.body));
    }));
});

export default router;
