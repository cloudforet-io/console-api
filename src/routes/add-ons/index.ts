import express from 'express';
import excelRouter from './excel';
import autocompleteRouter from './autocomplete';
import pageDiscoveryRouter from './page-discovery';
import pageSchemaRouter from './page-schema';
import menuRouter from './menu';

const router = express.Router();
router.use('/excel', excelRouter);
router.use('/autocomplete', autocompleteRouter);
router.use('/page-discovery', pageDiscoveryRouter);
router.use('/page-schema', pageSchemaRouter);
router.use('/menu', menuRouter);

export default router;

