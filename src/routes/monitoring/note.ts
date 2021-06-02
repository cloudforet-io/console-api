import express from 'express';
import asyncHandler from 'express-async-handler';
import * as note from '@controllers/monitoring/note';

const router = express.Router();

const controllers = [
    { url: '/create', func: note.createNote },
    { url: '/update', func: note.updateNote },
    { url: '/delete', func: note.deleteNote },
    { url: '/get', func: note.getNote },
    { url: '/list', func: note.listNotes },
    { url: '/stat', func: note.statNotes }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
