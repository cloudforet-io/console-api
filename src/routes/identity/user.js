import express from 'express';
import asyncHandler from 'express-async-handler';
import * as user from '@controllers/identity/user';

const router = express.Router();
const controllers = [
    { url: '/create', func: user.createUser },
    { url: '/update', func: user.updateUser },
    { url: '/delete', func: user.deleteUser },
    { url: '/enable', func: user.enableUser },
    { url: '/disable', func: user.disableUser },
    { url: '/update-role', func: user.updateRoleUser },
    { url: '/find', func: user.findUser },
    { url: '/sync', func: user.syncUser },
    { url: '/get', func: user.getUser },
    { url: '/list', func: user.listUsers }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
