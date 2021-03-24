import express from 'express';
import historyRouter from './history';
import scheduleRouter from './schedule';
import resourceRouter from './resource';
import topicRouter from './topic';

const router = express.Router();

router.use('/resource', resourceRouter);
router.use('/topic', topicRouter);
router.use('/history', historyRouter);
router.use('/schedule', scheduleRouter);

export default router;
