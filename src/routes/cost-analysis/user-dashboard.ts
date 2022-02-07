import express from 'express';
import asyncHandler from 'express-async-handler';
import * as userDashboard from '@controllers/cost-analysis/user-dashboard';

const router = express.Router();

const controllers = [
    { url: '/create', func: userDashboard.createUserDashboard },
    { url: '/update', func: userDashboard.updateUserDashboard },
    { url: '/delete', func: userDashboard.deleteUserDashboard },
    { url: '/get', func: userDashboard.getUserDashboard },
    { url: '/list', func: userDashboard.listUserDashboards },
    { url: '/stat', func: userDashboard.statUserDashboards }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
