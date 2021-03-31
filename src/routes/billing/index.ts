import express from 'express';
import dataSourceRouter from './data-source';
import billingRouter from './billing';

const router = express.Router();

router.use('/data-source', dataSourceRouter);
router.use('/billing', billingRouter);
export default router;
