import express from 'express';
import excel from '@/add-ons/excel/routes';
import file from './file';
const router = express.Router();

router.use('/excel', excel);
router.use('/file', file);

export default router;
