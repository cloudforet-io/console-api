import express from 'express';
import asyncHandler from 'express-async-handler';

import * as board from '@controllers/board/board';

const router = express.Router();

const controllers = [
    { url: '/create', func: board.createBoard },
    { url: '/update', func: board.updateBoard },
    { url: '/set_categories', func: board.setBoardCategories },
    { url: '/delete', func: board.deleteBoard },
    { url: '/get', func: board.getBoard },
    { url: '/list', func: board.listBoards },
    { url: '/stat', func: board.statBoards }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
