import express from 'express';
import asyncHandler from 'express-async-handler';
import createDomain from 'controllers/identity/domain/create-domain';
import deleteDomain from 'controllers/identity/domain/delete-domain';
import listDomains from 'controllers/identity/domain/list-domains';

const router = express.Router();
const controllers = [
    { url: '/create', func: createDomain },
    { url: '/delete', func: deleteDomain },
    { url: '/list', func: listDomains }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
