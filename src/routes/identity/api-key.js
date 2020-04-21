import express from 'express';
import asyncHandler from 'express-async-handler';
import * as apiKey from '@controllers/identity/api-key';

const router = express.Router();

const controllers = [

    { url: '/create', func: apiKey.createAPIKey },
    { url: '/enable', func: apiKey.enableAPIKey },
    { url: '/disable', func: apiKey.disableAPIKey },
    { url: '/allowed-hosts/update', func: apiKey.updateAllowedHostsAPIKey },
    { url: '/delete', func: apiKey.deleteAPIKey },
    { url: '/get', func: apiKey.getAPIKey },
    { url: '/list', func: apiKey.listAPIKeys },
    { url: '/stat', func: apiKey.statAPIKeys }

];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
