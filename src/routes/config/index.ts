import express from 'express';
import userConfigRouter from './user-config';

const router = express.Router();

router.use('/user-config', userConfigRouter);

export default router;
