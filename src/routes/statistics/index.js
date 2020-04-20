import express from 'express';
import historyRouter from './history';
import scheduleRouter from './schedule';
import statRouter from './stat';

const router = express.Router();
router.use('/stat', statRouter);
router.use('/history', historyRouter);
router.use('/schedule', scheduleRouter);

export default router;
