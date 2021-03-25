import express from 'express';
import asyncHandler from 'express-async-handler';
import * as endpoint from '@controllers/identity/endpoint';

const router = express.Router();

const controllers = [
    { url: '/list', func: endpoint.listEndpoints }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
