import express from 'express';
import asyncHandler from 'express-async-handler';
import * as template from '@controllers/report/template';

const router = express.Router();

const controllers = [
    { url: '/get', func: template.getTemplate },
    { url: '/list', func: template.listTemplates }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
