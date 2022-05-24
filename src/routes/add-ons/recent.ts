import express from 'express';
import asyncHandler from 'express-async-handler';

import * as recentSearch from '@controllers/add-ons/recent/search';
import * as recentVisit from '@controllers/add-ons/recent/visit';

const router = express.Router();

const controllers = [
    { url: '/visit/create', func: recentVisit.createRecentVisit, method: 'post' },
    { url: '/visit/list', func: recentVisit.listRecentVisit, method: 'post' },
    { url: '/search/create', func: recentSearch.createRecentSearch, method: 'post' },
    { url: '/search/list', func: recentSearch.listRecentSearch, method: 'post' }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
