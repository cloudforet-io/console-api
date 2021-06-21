import express from 'express';
import asyncHandler from 'express-async-handler';
import * as eventRule from '@controllers/monitoring/event-rule';

const router = express.Router();

const controllers = [
    { url: '/create', func: eventRule.createEventRule },
    { url: '/update', func: eventRule.updateEventRule },
    { url: '/change-order', func: eventRule.changeOrderEventRule },
    { url: '/delete', func: eventRule.deleteEventRule },
    { url: '/get', func: eventRule.getEventRule },
    { url: '/list', func: eventRule.listEventRule },
    { url: '/stat', func: eventRule.statEventRule }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
