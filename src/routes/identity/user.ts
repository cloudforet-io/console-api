import express from 'express';
import asyncHandler from 'express-async-handler';
import * as user from '@controllers/identity/user';

const router = express.Router();

const controllers = [
    { url: '/create', func: user.createUser },
    { url: '/update', func: user.updateUser },
    { url: '/delete', func: user.deleteUsers },
    { url: '/enable', func: user.enableUsers },
    { url: '/disable', func: user.disableUsers },
    { url: '/update-role', func: user.updateRoleUser },
    { url: '/find', func: user.findUser },
    { url: '/sync', func: user.syncUser },
    { url: '/get', func: user.getUser },
    { url: '/list', func: user.listUsers },
    { url: '/stat', func: user.statUsers }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
