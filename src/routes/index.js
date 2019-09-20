import express from 'express';
import statisticsRouter from './statistics';
import identityRouter from './identity';
import repositoryRouter from './repository';
import secretRouter from './secret';
import inventoryRouter from './inventory';

const router = express.Router();
router.use('/statistics', statisticsRouter);
router.use('/identity', identityRouter);
router.use('/repository', repositoryRouter);
router.use('/secret', secretRouter);
router.use('/inventory', inventoryRouter);

export default router;
