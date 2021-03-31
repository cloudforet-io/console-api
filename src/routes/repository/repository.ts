import express from 'express';
import asyncHandler from 'express-async-handler';
import * as Repository from '@controllers/repository/repository';

const router = express.Router();

const controllers = [
    { url: '/register', func: Repository.registerRepository },
    { url: '/update', func: Repository.updateRepository },
    { url: '/deregister', func: Repository.deregisterRepository },
    { url: '/get', func: Repository.getRepository },
    { url: '/list', func: Repository.listRepositories },
    { url: '/stat', func: Repository.statRepositories }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
