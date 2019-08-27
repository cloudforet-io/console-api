import express from 'express';
import asyncHandler from 'express-async-handler';
import * as remoteRepository from '@controllers/repository/remote-repository';

const router = express.Router();
const controllers = [
    { url: '/register', func: remoteRepository.registerRemoteRepository },
    { url: '/update', func: remoteRepository.updateRemoteRepository },
    { url: '/deregister', func: remoteRepository.deregisterRemoteRepository },
    { url: '/get', func: remoteRepository.getRemoteRepository },
    { url: '/list', func: remoteRepository.listRemoteRepositories }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
