import express from 'express';
import statisticsRouter from './statistics';
import identityRouter from './identity';
import repositoryRouter from './repository';
import secretRouter from './secret';
import inventoryRouter from './inventory';
import { signIn, signOut } from '@lib/authentication';
import { issueToken } from '@controllers/identity/token';

const router = express.Router();
router.use('/statistics', statisticsRouter);
router.use('/identity', identityRouter);
router.use('/repository', repositoryRouter);
router.use('/secret', secretRouter);
router.use('/inventory', inventoryRouter);
router.use('/sign-in', signIn(issueToken));
router.use('/sign-out', signOut());

export default router;
