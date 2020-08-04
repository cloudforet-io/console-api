import express from 'express';
import supervisorRouter from './supervisor';
const router = express.Router();

router.use('/supervisor', supervisorRouter);
export default router;
