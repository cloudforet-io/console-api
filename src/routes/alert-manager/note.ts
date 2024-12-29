import express from 'express';
import asyncHandler from 'express-async-handler';

import * as note from '@controllers/alert-manager/note';

const router = express.Router();

const controllers = [
    { url: '/list', func: note.listNotes }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
