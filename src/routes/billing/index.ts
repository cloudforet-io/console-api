import express from 'express';

import billingRouter from './billing';
import dataSourceRouter from './data-source';

const router = express.Router();

router.use('/data-source', dataSourceRouter);
router.use('/billing', billingRouter);
export default router;
