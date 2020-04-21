import express from 'express';
import supervisorRouter from './supervisor';
import pluginRouter from './plugin';
const router = express.Router();

router.use('/supervisor', supervisorRouter);
router.use('/plugin', pluginRouter);
export default router;
