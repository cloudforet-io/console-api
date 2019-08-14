import express from 'express';
import pluginRouter from './plugin';

const router = express.Router();
router.use('/plugin', pluginRouter);

export default router;
