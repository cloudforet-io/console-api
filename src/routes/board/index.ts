import express from 'express';

import boardRouter from './board';
import postRouter from './post';

const router = express.Router();

router.use('/board', boardRouter);
router.use('/post', postRouter);

export default router;
