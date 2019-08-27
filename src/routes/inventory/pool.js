import express from 'express';
import asyncHandler from 'express-async-handler';
import * as pool from '@controllers/inventory/pool';

const router = express.Router();
const controllers = [
    { url: '/create', func: pool.createPool },
    { url: '/update', func: pool.updatePool },
    { url: '/delete', func: pool.deletePool },
    { url: '/get', func: pool.getPool },
    { url: '/admin/add', func: pool.addPoolAdmin },
    { url: '/admin/modify', func: pool.modifyPoolAdmin },
    { url: '/admin/remove', func: pool.removePoolAdmin },
    { url: '/admin/list', func: pool.listPoolAdmins },
    { url: '/list', func: pool.listPools }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
