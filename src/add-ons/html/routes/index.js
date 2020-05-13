import express from 'express';
import asyncHandler from 'express-async-handler';
import * as html from '@/add-ons/html/controllers';

const router = express.Router();
const controllers = [
    { url: '/render', func: html.renderingTemplate }
];

controllers.map((config) => {
    const method = config.url === '/render' ? 'get' : 'post';
    router[method](config.url, asyncHandler(async (req, res, next) => {
        if(method === 'post') res.json(await config.func(req.body));
        else await config.func(req.body, res);
    }));
});

module.exports = router;
