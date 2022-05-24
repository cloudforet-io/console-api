import express from 'express';

import autocompleteRouter from './autocomplete';
import excelRouter from './excel';
import favoriteRouter from './favorite';
import pageDiscoveryRouter from './page-discovery';
import pageSchemaRouter from './page-schema';
import recentRouter from './recent';

const router = express.Router();
router.use('/excel', excelRouter);
router.use('/autocomplete', autocompleteRouter);
router.use('/page-discovery', pageDiscoveryRouter);
router.use('/page-schema', pageSchemaRouter);
router.use('/favorite', favoriteRouter);
router.use('/recent', recentRouter);

export default router;

