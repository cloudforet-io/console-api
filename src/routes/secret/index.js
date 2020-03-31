import express from 'express';
import secretRouter from './secret';
import secretGroupRouter from './secret-group';

const router = express.Router();
router.use('/secret', secretRouter);
router.use('/secret-group', secretGroupRouter);


export default router;
