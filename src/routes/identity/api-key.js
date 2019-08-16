import express from 'express';
import asyncHandler from 'express-async-handler';
import * as apiKey from '@controllers/identity/api-key';

const router = express.Router();
const controllers = [
    { url: '/create', func: apiKey.createAPIKey },
    { url: '/delete', func: apiKey.deleteAPIKey },
    { url: '/enable', func: apiKey.enableAPIKey },
    { url: '/disable', func: apiKey.disableAPIKey },
    { url: '/update-role', func: apiKey.updateRoleAPIKey },
    { url: '/update-allowed-hosts', func: apiKey.updateAllowedHostsAPIKey },
    { url: '/get', func: apiKey.getAPIKey },
    { url: '/list', func: apiKey.listAPIKeys }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
