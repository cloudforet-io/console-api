import express from 'express';
import asyncHandler from 'express-async-handler';
import listUsers from 'controllers/identity/user/list-users';

const router = express.Router();
const controllers = [
    { url: '/list', func: listUsers }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
