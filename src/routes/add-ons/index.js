import express from 'express';
import excelRouter from './excel';
import autocompleteRouter from './autocomplete';
import awsHealthRouter from './aws-health';
import pageDiscoveryRouter from './page-discovery';
import pageSchemaRouter from './page-schema';

const router = express.Router();
router.use('/excel', excelRouter);
router.use('/autocomplete', autocompleteRouter);
router.use('/aws-health', awsHealthRouter);
router.use('/page-discovery', pageDiscoveryRouter);
router.use('/page-schema', pageSchemaRouter);

module.exports = router;
